import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";

const bodySchema = z.object({ code: z.string().min(1) });

// POST /api/coupons/validate — valida un cupón y retorna el % de descuento
export async function POST(req: NextRequest) {
  try {
    await requireSession();
    const { code } = bodySchema.parse(await req.json());

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.active) {
      return NextResponse.json({ error: "Cupón inválido o inactivo" }, { status: 404 });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: "El cupón ha expirado" }, { status: 410 });
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "El cupón ya alcanzó su límite de usos" }, { status: 410 });
    }

    return NextResponse.json({
      code: coupon.code,
      discountPct: coupon.discountPct,
      description: coupon.description,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
