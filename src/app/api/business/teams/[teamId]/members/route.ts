import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError, ApiError } from "@/lib/api-helpers";
import { resolveOrgAdmin } from "@/lib/org-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.organizationId !== org.id) {
      throw new ApiError(404, "Equipo no encontrado");
    }

    const { memberId } = await req.json();
    if (!memberId) throw new ApiError(400, "memberId es requerido");

    const member = await prisma.orgMember.findUnique({ where: { id: memberId } });
    if (!member || member.organizationId !== org.id) {
      throw new ApiError(404, "Miembro no encontrado");
    }

    const teamMember = await prisma.teamMember.create({
      data: { teamId, memberId },
    });

    return NextResponse.json({ teamMember }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
