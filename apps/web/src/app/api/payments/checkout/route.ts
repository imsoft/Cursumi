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

    // Validar que el sessionId pertenece al curso antes de continuar
    if (sessionId) {
      const validSession = await prisma.courseSession.findFirst({
        where: { id: sessionId, courseId },
        select: { id: true },
      });
      if (!validSession) {
        return NextResponse.json({ error: "Sesión de curso no válida" }, { status: 400 });
      }
    }

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

    // Validar cupón si se envió. Los errores son explícitos: si el cupón ya no
    // aplica, NUNCA seguimos en silencio cobrando el precio completo.
    let appliedCoupon: { code: string; discountPct: number } | null = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });
      if (!coupon || !coupon.active) {
        return NextResponse.json({ error: "Cupón inválido o inactivo" }, { status: 422 });
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return NextResponse.json({ error: "El cupón ha expirado" }, { status: 422 });
      }
      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ error: "El cupón ya alcanzó su límite de usos" }, { status: 422 });
      }
      if (coupon.courseId && coupon.courseId !== courseId) {
        return NextResponse.json({ error: "Este cupón no es válido para este curso" }, { status: 422 });
      }
      // Un solo uso exitoso por usuario
      const alreadyUsed = await prisma.transaction.findFirst({
        where: { userId: session.user.id, couponCode: coupon.code, status: "completed" },
        select: { id: true },
      });
      if (alreadyUsed) {
        return NextResponse.json({ error: "Ya usaste este cupón anteriormente" }, { status: 422 });
      }
      appliedCoupon = { code: coupon.code, discountPct: coupon.discountPct };
    }

    // Si ya hay una sesión de pago pendiente CON EL MISMO CUPÓN, reutilizarla.
    // Si el cupón cambió, la sesión vieja cobraría el precio equivocado:
    // se expira y se crea una nueva.
    const pendingTransaction = await prisma.transaction.findFirst({
      where: { userId: session.user.id, courseId, status: "pending" },
      select: { id: true, stripeSessionId: true, couponCode: true },
      orderBy: { createdAt: "desc" },
    });
    if (pendingTransaction?.stripeSessionId) {
      const sameCoupon =
        (pendingTransaction.couponCode ?? null) === (appliedCoupon?.code ?? null);
      if (sameCoupon) {
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
      } else {
        try {
          await stripe.checkout.sessions.expire(pendingTransaction.stripeSessionId);
        } catch {
          // Ya estaba expirada/completada en Stripe — continuar
        }
        await prisma.transaction.update({
          where: { id: pendingTransaction.id },
          data: { status: "failed" },
        });
      }
    }

    const originalPrice = course.price;
    // `Course.price` está en PESOS enteros (MXN). Stripe cobra en CENTAVOS y
    // los campos almacenados (transaction.amount, platformFee, instructorAmount)
    // se guardan en centavos — así lo esperan finanzas, referidos y admin (÷100).
    const discountedPriceMxn = appliedCoupon
      ? Math.round(originalPrice * (1 - appliedCoupon.discountPct / 100))
      : originalPrice;

    const amountCents = discountedPriceMxn * 100;

    // Stripe no procesa cargos menores a $10 MXN. Si el descuento deja el precio
    // debajo del mínimo, inscribimos gratis (el instructor ya regaló ≥90%).
    const MIN_STRIPE_AMOUNT_CENTS = 1000;

    // ── Fast-path: cupón 100% (o bajo el mínimo de Stripe) → sin Stripe ──────
    // Stripe no dispara `checkout.session.completed` cuando unit_amount = 0,
    // por lo que el webhook nunca enrollaría al estudiante. En este caso
    // inscribimos directamente igual que en cursos gratuitos.
    if (amountCents === 0 || (appliedCoupon && amountCents < MIN_STRIPE_AMOUNT_CENTS)) {
      const platformFeePercent = await getPlatformFeePercent();
      const { platformFee, instructorAmount } = calculateSplit(0, platformFeePercent);

      const transaction = await prisma.transaction.create({
        data: {
          userId: session.user.id,
          courseId,
          amount: 0,
          currency: "MXN",
          status: "completed",
          stripeSessionId: null,
          platformFee,
          instructorAmount,
          couponCode: appliedCoupon?.code ?? null,
        },
      });

      const enrollment = await prisma.enrollment.upsert({
        where: { courseId_studentId: { courseId, studentId: session.user.id } },
        update: { ...(sessionId ? { sessionId } : {}) },
        create: { courseId, studentId: session.user.id, sessionId: sessionId ?? null, status: "active" },
      });

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { enrollmentId: enrollment.id },
      });

      // Incrementar cupón de forma atómica
      if (appliedCoupon?.code) {
        await prisma.$executeRaw`
          UPDATE "Coupon"
          SET "usedCount" = "usedCount" + 1
          WHERE code = ${appliedCoupon.code}
            AND active = true
            AND ("maxUses" IS NULL OR "usedCount" < "maxUses")
        `;
      }

      const successUrl = `${baseUrl}/dashboard/my-courses/${courseId}?enrolled=true`;
      return NextResponse.json({ url: successUrl, discountPct: appliedCoupon?.discountPct ?? 0 });
    }
    // ──────────────────────────────────────────────────────────────────────────

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
