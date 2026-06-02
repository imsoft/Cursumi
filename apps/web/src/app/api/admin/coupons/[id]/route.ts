import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

const patchSchema = z.object({
  active: z.boolean().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { id } = await params;
    const body = patchSchema.parse(await req.json());

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(body.active !== undefined && { active: body.active }),
        ...(body.maxUses !== undefined && { maxUses: body.maxUses }),
        ...(body.expiresAt !== undefined && {
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        }),
      },
    });
    return NextResponse.json(coupon);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { id } = await params;
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
