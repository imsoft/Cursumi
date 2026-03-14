import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

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

    // Usar courseId/userId de la transacción en BD (fuente de verdad), no del metadata
    const { courseId, userId } = transaction;

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "completed" },
    });

    // Enroll student
    const enrollment = await prisma.enrollment.upsert({
      where: { courseId_studentId: { courseId, studentId: userId } },
      update: {},
      create: { courseId, studentId: userId, status: "active" },
    });

    // Link transaction to enrollment
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { enrollmentId: enrollment.id },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId,
        type: "enrollment",
        title: "Inscripción confirmada",
        body: "Tu pago fue procesado exitosamente. ¡Ya puedes acceder al curso!",
        link: `/dashboard/my-courses/${courseId}`,
      },
    });

    // Notify instructor
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true, title: true },
    });
    if (course) {
      await prisma.notification.create({
        data: {
          userId: course.instructorId,
          type: "enrollment",
          title: "Nueva inscripción",
          body: `Un nuevo estudiante se inscribió en "${course.title}".`,
          link: `/instructor/courses/${courseId}`,
        },
      });
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
