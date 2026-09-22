/**
 * Rellena Transaction.stripeFee en las ventas cobradas antes de que el webhook
 * lo guardara. Lee la comisión real del balance_transaction de cada pago.
 *
 *   source .env && DATABASE_URL="$DATABASE_URL" STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" pnpm tsx scripts/backfill-stripe-fee.ts
 *
 * Es seguro repetirlo: solo toca filas con stripeFee NULL y stripePaymentId.
 */
import { prisma } from "../src/lib/prisma";
import { fetchStripeFee } from "../src/lib/stripe-fee";

async function main() {
  const rows = await prisma.transaction.findMany({
    where: { status: "completed", stripeFee: null, stripePaymentId: { not: null } },
    select: { id: true, stripePaymentId: true, amount: true },
    orderBy: { createdAt: "asc" },
  });
  console.log(`${rows.length} ventas sin comisión de Stripe registrada.`);

  let ok = 0;
  for (const t of rows) {
    const fee = await fetchStripeFee(t.stripePaymentId!);
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
