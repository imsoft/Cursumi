import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

const createSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional(),
  discountPct: z.number().int().min(1).max(100),
  maxUses: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  courseId: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    // Para cada cupón, traer los usos desde Transaction
    const codes = coupons.map((c) => c.code);
    const usages = codes.length
      ? await prisma.transaction.findMany({
          where: { couponCode: { in: codes } },
          select: {
            id: true,
            couponCode: true,
            courseId: true,
            userId: true,
            amount: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
            course: { select: { title: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

    const usagesByCoupon: Record<string, typeof usages> = {};
    for (const u of usages) {
      if (!u.couponCode) continue;
      if (!usagesByCoupon[u.couponCode]) usagesByCoupon[u.couponCode] = [];
      usagesByCoupon[u.couponCode].push(u);
    }

    const result = coupons.map((c) => ({
      ...c,
      usages: (usagesByCoupon[c.code] ?? []).map((u) => ({
        ...u,
        discountPct: c.discountPct,
      })),
    }));

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const body = createSchema.parse(await req.json());
    const coupon = await prisma.coupon.create({
      data: {
        code: body.code,
        description: body.description,
        discountPct: body.discountPct,
        maxUses: body.maxUses ?? null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        courseId: body.courseId ?? null,
      },
      include: { course: { select: { id: true, title: true } } },
    });
    return NextResponse.json({ ...coupon, usages: [] }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
