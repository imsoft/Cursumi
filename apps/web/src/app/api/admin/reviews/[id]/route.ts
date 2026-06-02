import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

const patchSchema = z.object({
  approved: z.boolean(),
});

// PATCH /api/admin/reviews/[id] — aprobar o rechazar reseña
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { id } = await params;
    const body = patchSchema.parse(await req.json());

    const review = await prisma.review.update({
      where: { id },
      data: { approved: body.approved },
    });

    return NextResponse.json(review);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/admin/reviews/[id] — eliminar reseña
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { id } = await params;
    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
