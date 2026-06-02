import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, requireRole, handleApiError } from "@/lib/api-helpers";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; progressId: string }> }
) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { id, progressId } = await params;
    const entry = await prisma.kpiProgress.findUnique({ where: { id: progressId } });
    if (!entry || entry.kpiId !== id) {
      return NextResponse.json({ error: "Entrada no encontrada" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.kpiProgress.delete({ where: { id: progressId } }),
      prisma.kpi.update({
        where: { id },
        data: { currentValue: { decrement: entry.value } },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
