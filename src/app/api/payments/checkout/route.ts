import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe, calculateSplit } from "@/lib/stripe";
import { handleApiError, requireSession } from "@/lib/api-helpers";

const bodySchema = z.object({
  courseId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { courseId } = bodySchema.parse(await req.json());

    const course = await prisma.course.findUnique({
      where: { id: courseId, status: "published" },
      select: { id: true, title: true, price: true, imageUrl: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { courseId_studentId: { courseId, studentId: session.user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Ya estás inscrito en este curso" }, { status: 409 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const amountCents = course.price; // price is already in cents (MXN)
    const { platformFee, instructorAmount } = calculateSplit(amountCents);

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: course.title,
              images: course.imageUrl ? [course.imageUrl] : [],
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/dashboard/my-courses/${courseId}?enrolled=true`,
      cancel_url: `${baseUrl}/dashboard/explore/${courseId}`,
      metadata: {
        courseId,
        userId: session.user.id,
      },
    });

    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        courseId,
        amount: amountCents,
        currency: "MXN",
        status: "pending",
        stripeSessionId: checkoutSession.id,
        platformFee,
        instructorAmount,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    return handleApiError(error);
  }
}
