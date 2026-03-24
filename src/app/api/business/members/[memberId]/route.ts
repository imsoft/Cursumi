import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError, ApiError } from "@/lib/api-helpers";
import { resolveOrgAdmin } from "@/lib/org-service";
import type { OrgRole } from "@/generated/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const member = await prisma.orgMember.findUnique({ where: { id: memberId } });
    if (!member || member.organizationId !== org.id) {
      throw new ApiError(404, "Miembro no encontrado");
    }
    if (member.orgRole === "owner") {
      throw new ApiError(400, "No puedes cambiar el rol del dueño");
    }

    const { orgRole } = (await req.json()) as { orgRole: OrgRole };
    if (!["admin", "member"].includes(orgRole)) {
      throw new ApiError(400, "Rol inválido");
    }

    const updated = await prisma.orgMember.update({
      where: { id: memberId },
      data: { orgRole },
    });

    return NextResponse.json({ member: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const member = await prisma.orgMember.findUnique({ where: { id: memberId } });
    if (!member || member.organizationId !== org.id) {
      throw new ApiError(404, "Miembro no encontrado");
    }
    if (member.orgRole === "owner") {
      throw new ApiError(400, "No puedes eliminar al dueño de la organización");
    }

    await prisma.orgMember.delete({ where: { id: memberId } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
