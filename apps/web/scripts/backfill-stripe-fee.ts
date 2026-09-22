/**
 * Rellena Transaction.stripeFee en las ventas cobradas antes de que el webhook
 * lo guardara. Lee la comisión real del balance_transaction de cada pago.
 *
 *   source .env && DATABASE_URL="$DATABASE_URL" STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" pnpm tsx scripts/backfill-stripe-fee.ts
 *
 * Es seguro repetirlo: solo toca filas con stripeFee NULL que tengan PaymentIntent o sesión de checkout.
 */
import { prisma } from "../src/lib/prisma";
import { stripe } from "../src/lib/stripe";
import { fetchStripeFee } from "../src/lib/stripe-fee";

async function main() {
  const rows = await prisma.transaction.findMany({
    where: { status: "completed", stripeFee: null, OR: [{ stripePaymentId: { not: null } }, { stripeSessionId: { not: null } }] },
    select: { id: true, stripePaymentId: true, stripeSessionId: true, amount: true },
    orderBy: { createdAt: "asc" },
  });
  console.log(`${rows.length} ventas sin comisión de Stripe registrada.`);

  let ok = 0;
  for (const t of rows) {
    let paymentIntentId = t.stripePaymentId;
    // Ventas anteriores a que el webhook guardara el PaymentIntent: se
    // recupera desde la sesión de checkout y se guarda, que también hace
    // falta para casar reembolsos.
    if (!paymentIntentId && t.stripeSessionId) {
      const session = await stripe.checkout.sessions.retrieve(t.stripeSessionId);
      paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);
      if (paymentIntentId) {
        await prisma.transaction.update({ where: { id: t.id }, data: { stripePaymentId: paymentIntentId } });
      }
    }
    if (!paymentIntentId) {
      console.warn(`  ${t.id}: sin PaymentIntent (cobrado ${t.amount / 100}), se omite.`);
      continue;
    }
    const fee = await fetchStripeFee(paymentIntentId);
    if (fee == null) {
      console.warn(`  ${t.id}: sin balance_transaction todavía, se omite.`);
      continue;
    }
    await prisma.transaction.update({ where: { id: t.id }, data: { stripeFee: fee } });
    ok += 1;
    console.log(`  ${t.id}: cobrado ${t.amount / 100} → Stripe ${fee / 100}`);
  }
  console.log(`Listo: ${ok} de ${rows.length} actualizadas.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
