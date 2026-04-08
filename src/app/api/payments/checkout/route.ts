import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe, calculateSplit } from "@/lib/stripe";
import { getPlatformFeePercent } from "@/lib/platform-fee";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { checkRateLimitAsync } from "@/lib/rate-limit";

const bodySchema = z.object({
  courseId: z.string().min(1),
  couponCode: z.string().optional(),
  sessionId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();

    // Máximo 5 checkouts por hora por usuario — evita abuso de sesiones Stripe
    const limited = await checkRateLimitAsync({
      key: `checkout:${session.user.id}`,
      limit: 5,
      windowSecs: 3600,
    });
    if (limited) return limited;
    const { courseId, couponCode, sessionId } = bodySchema.parse(await req.json());

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

    // Si ya hay una sesión de pago pendiente, reutilizarla en lugar de crear otra
    const pendingTransaction = await prisma.transaction.findFirst({
      where: { userId: session.user.id, courseId, status: "pending" },
      select: { stripeSessionId: true },
      orderBy: { createdAt: "desc" },
    });
    if (pendingTransaction?.stripeSessionId) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(
          pendingTransaction.stripeSessionId
        );
        if (existingSession.status === "open" && existingSession.url) {
          return NextResponse.json({ url: existingSession.url });
        }
      } catch {
        // La sesión ya no existe en Stripe, continuar creando una nueva
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Validar cupón si se envió
    let appliedCoupon: { code: string; discountPct: number } | null = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });
      if (
        coupon &&
        coupon.active &&
        (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
        (coupon.maxUses === null || coupon.usedCount < coupon.maxUses)
      ) {
        appliedCoupon = { code: coupon.code, discountPct: coupon.discountPct };
      }
    }

    const originalPrice = course.price;
    const discountedPrice = appliedCoupon
      ? Math.round(originalPrice * (1 - appliedCoupon.discountPct / 100))
      : originalPrice;

    const amountCents = discountedPrice;
    const platformFeePercent = await getPlatformFeePercent();
    const { platformFee, instructorAmount } = calculateSplit(amountCents, platformFeePercent);

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
        ...(sessionId ? { sessionId } : {}),
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
        couponCode: appliedCoupon?.code ?? null,
      },
    });

    // El contador de uso del cupón se incrementa en el webhook SOLO cuando
    // el pago es confirmado, para evitar doble-consumo ante pagos abandonados.

    return NextResponse.json({
      url: checkoutSession.url,
      discountPct: appliedCoupon?.discountPct ?? 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
