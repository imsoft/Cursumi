import { NextRequest, NextResponse } from "next/server";
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = event.data.object as any;
    const courseId = session.metadata?.courseId as string;
    const userId = session.metadata?.userId as string;

    const transaction = await prisma.transaction.findUnique({
      where: { stripeSessionId: session.id },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

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

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as { id: string };
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
