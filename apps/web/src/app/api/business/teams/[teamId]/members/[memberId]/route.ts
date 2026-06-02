import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError, ApiError } from "@/lib/api-helpers";
import { resolveOrgAdmin } from "@/lib/org-service";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const { teamId, memberId } = await params;
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.organizationId !== org.id) {
      throw new ApiError(404, "Equipo no encontrado");
    }

    await prisma.teamMember.delete({
      where: { teamId_memberId: { teamId, memberId } },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
