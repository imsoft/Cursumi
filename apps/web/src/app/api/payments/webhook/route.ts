import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { notifyAdmins, notifyEnrollment } from "@/lib/notification-helpers";
import { fetchStripeFee } from "@/lib/stripe-fee";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook error: ${err instanceof Error ? err.message : "Unknown"}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const transaction = await prisma.transaction.findUnique({
      where: { stripeSessionId: session.id },
    });

    if (!transaction) {
      // Retornar 200 para que Stripe no reintente — puede ser un evento duplicado
      console.warn(`Webhook: transacción no encontrada para sesión ${session.id}`);
      return NextResponse.json({ received: true });
    }

    // Idempotency guard: si la transacción ya fue completada, no reenviar emails ni notificaciones
    const alreadyCompleted = transaction.status === "completed";

    // Usar courseId/userId de la transacción en BD (fuente de verdad), no del metadata
    const { courseId, userId } = transaction;
    const sessionId = (session.metadata?.sessionId as string) || null;

    if (!alreadyCompleted) {
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);
      // Lo que Stripe se quedó de este cobro: sin esto el admin ve la comisión
      // de Cursumi pero no el neto real. Si falla, la venta se registra igual
      // y queda en null para el backfill.
      const stripeFee = paymentIntentId ? await fetchStripeFee(paymentIntentId) : null;
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "completed",
          stripeFee,
          // Sesiones creadas antes de existir el estado de pago: si hay parte
          // para el instructor y no se repartió en el cobro, queda pendiente.
          ...(transaction.payoutStatus === "none" && (transaction.instructorAmount ?? 0) > 0
            ? { payoutStatus: "pending" as const }
            : {}),
          // Sin el PaymentIntent no hay manera de encontrar esta transacción
          // cuando Stripe avise de un reembolso: el evento charge.refunded no
          // trae el id de la sesión de checkout.
          stripePaymentId: paymentIntentId,
        },
      });
    }

    // Enroll student (upsert es seguro si se llama dos veces)
    const enrollment = await prisma.enrollment.upsert({
      where: { courseId_studentId: { courseId, studentId: userId } },
      update: { ...(sessionId ? { sessionId } : {}) },
      create: { courseId, studentId: userId, sessionId, status: "active" },
    });

    // Link transaction to enrollment
    if (!alreadyCompleted) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { enrollmentId: enrollment.id },
      });

      // Incrementar cupón SOLO al confirmar el pago.
      // Operación atómica: solo incrementa si aún está bajo el límite,
      // evitando race conditions con múltiples webhooks simultáneos.
      if (transaction.couponCode) {
        const filas = await prisma.$executeRaw`
          UPDATE "Coupon"
          SET "usedCount" = "usedCount" + 1
          WHERE code = ${transaction.couponCode}
            AND active = true
            AND ("maxUses" IS NULL OR "usedCount" < "maxUses")
        `;
        // 0 filas = el cupón se agotó entre que se creó la sesión de pago y que
        // llegó este webhook. El cobro ya se hizo con descuento, así que no se
        // revierte nada, pero queda registrado para poder revisarlo.
        if (filas === 0) {
          console.warn(
            `[pagos] El cupón ${transaction.couponCode} se usó por encima de su límite ` +
            `(transacción ${transaction.id}). Se respetó el descuento ya cobrado.`,
          );
        }
      }

      // Avisos, correo de bienvenida y comisión de referido — mismo helper que
      // usa el camino sin pago, para que ambos hagan exactamente lo mismo.
      await notifyEnrollment({
        studentId: userId,
        courseId,
        transactionId: transaction.id,
      });
    }
  }

  /**
   * Reembolsos.
   *
   * La política pública promete devolución dentro de 7 días, pero no había
   * nada que escuchara este evento: al reembolsar desde Stripe la transacción
   * seguía en `completed`, así que continuaba sumando en los ingresos del
   * instructor y del panel de admin, y el alumno conservaba el acceso.
   *
   * Al marcarla `refunded` desaparece de los ingresos sola, porque todos esos
   * cálculos filtran por `completed`.
   *
   * Stripe dispara este mismo evento en los reembolsos PARCIALES, así que hay
   * que distinguirlos: devolver la mitad del importe por una queja no debe
   * dejar al alumno sin el curso. Los parciales solo avisan al admin, que es
   * quien decide qué hacer con el acceso.
   */
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : (charge.payment_intent?.id ?? null);

    const reembolsoTotal = charge.amount_refunded >= charge.amount;

    if (paymentIntentId && !reembolsoTotal) {
      const pesos = (centavos: number) =>
        (centavos / 100).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
      await notifyAdmins({
        type: "transaction_refunded_partial",
        title: "Reembolso parcial",
        body:
          `Se devolvieron ${pesos(charge.amount_refunded)} de ${pesos(charge.amount)}. ` +
          `El alumno conserva el acceso: revisa si procede retirarlo.`,
        link: "/admin/finances",
      });
    }

    if (paymentIntentId && reembolsoTotal) {
      const transaction = await prisma.transaction.findFirst({
        where: { stripePaymentId: paymentIntentId, status: "completed" },
        select: {
          id: true,
          enrollmentId: true,
          courseId: true,
          userId: true,
          couponCode: true,
        },
      });

      if (transaction) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          // Reembolso total: ya no se le debe nada al instructor. Si el pago fue
          // automático por Connect, la reversión del transfer se decide en el
          // dashboard de Stripe al reembolsar ("reverse transfer").
          data: { status: "refunded", payoutStatus: "none" },
        });

        // Se devolvió el dinero, así que se retira el acceso al curso.
        await prisma.enrollment.updateMany({
          where: { courseId: transaction.courseId, studentId: transaction.userId },
          data: { status: "cancelled" },
        });

        // Devolver el uso del cupón: si no, un cupón con límite se consume
        // para siempre aunque la compra se haya deshecho. El GREATEST evita
        // dejarlo en negativo si el contador ya se hubiera tocado a mano.
        if (transaction.couponCode) {
          await prisma.$executeRaw`
            UPDATE "Coupon"
            SET "usedCount" = GREATEST("usedCount" - 1, 0)
            WHERE code = ${transaction.couponCode}
          `;
        }

        await notifyAdmins({
          type: "transaction_refunded",
          title: "Reembolso procesado",
          body: "Se reembolsó una compra y se retiró el acceso al curso.",
          link: "/admin/finances",
        });
      } else {
        console.warn(
          `[pagos] Reembolso del PaymentIntent ${paymentIntentId} sin transacción completada asociada.`,
        );
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    await prisma.transaction.updateMany({
      where: { stripeSessionId: session.id, status: "pending" },
      data: { status: "failed" },
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    // Marcar transacciones pendientes asociadas a este PaymentIntent como fallidas
    await prisma.transaction.updateMany({
      where: { stripeSessionId: pi.id, status: "pending" },
      data: { status: "failed" },
    });
    console.error("Payment failed:", pi.id);
  }

  // ─── Business subscription events ───────────────────────────────────
  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const sub = event.data.object as Stripe.Subscription & {
      current_period_start?: number;
      current_period_end?: number;
    };
    const stripeCustomerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

    const periodStart = sub.current_period_start
      ? new Date(sub.current_period_start * 1000)
      : undefined;
    const periodEnd = sub.current_period_end
      ? new Date(sub.current_period_end * 1000)
      : undefined;

    // Asientos según el plan contratado (lo envía business/checkout en
    // subscription_data.metadata). Fallback a 10 por compatibilidad.
    const parsedSeats = Number.parseInt((sub.metadata?.maxSeats as string) || "", 10);
    const maxSeats = Number.isFinite(parsedSeats) && parsedSeats > 0 ? parsedSeats : 10;

    const normalizedStatus =
      sub.status === "active"
        ? "active"
        : sub.status === "trialing"
          ? "trialing"
          : sub.status === "past_due"
            ? "past_due"
            : "canceled";

    await prisma.orgSubscription.upsert({
      where: { stripeCustomerId },
      update: {
        stripeSubscriptionId: sub.id,
        status: normalizedStatus,
        maxSeats,
        ...(periodStart && { currentPeriodStart: periodStart }),
        ...(periodEnd && { currentPeriodEnd: periodEnd }),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
      create: {
        stripeCustomerId,
        stripeSubscriptionId: sub.id,
        status: normalizedStatus,
        maxSeats,
        ...(periodStart && { currentPeriodStart: periodStart }),
        ...(periodEnd && { currentPeriodEnd: periodEnd }),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        organization: { connect: { id: (sub.metadata?.organizationId as string) || "" } },
      },
    });
  }

  // Alta de empresa: ingreso recurrente nuevo, el admin debe enterarse.
  if (event.type === "customer.subscription.created") {
    const sub = event.data.object as Stripe.Subscription;
    const orgId = (sub.metadata?.organizationId as string) || null;
    const org = orgId
      ? await prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } })
      : null;
    await notifyAdmins({
      type: "org_subscribed",
      title: "Nueva empresa suscrita",
      body: `${org?.name ?? "Una empresa"} activó su suscripción.`,
      link: "/admin/business",
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const stripeCustomerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

    const canceled = await prisma.orgSubscription.findFirst({
      where: { stripeCustomerId },
      select: { organization: { select: { name: true } } },
    });

    await prisma.orgSubscription.updateMany({
      where: { stripeCustomerId },
      data: { status: "canceled" },
    });

    // Baja de empresa: conviene dar seguimiento cuanto antes.
    await notifyAdmins({
      type: "org_canceled",
      title: "Empresa canceló su suscripción",
      body: `${canceled?.organization?.name ?? "Una empresa"} dio de baja su plan.`,
      link: "/admin/business",
    });
  }

  // Instructor completó el onboarding de Stripe Connect
  if (event.type === "account.updated") {
    const account = event.data.object as { id: string; details_submitted: boolean; charges_enabled: boolean };
    if (account.details_submitted && account.charges_enabled) {
      await prisma.instructorProfile.updateMany({
        where: { stripeAccountId: account.id },
        data: { stripeOnboarded: true },
      });
    }
  }

  return NextResponse.json({ received: true });
}
