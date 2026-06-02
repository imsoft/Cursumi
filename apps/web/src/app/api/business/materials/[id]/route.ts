import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError, ApiError } from "@/lib/api-helpers";
import { resolveOrgAdmin } from "@/lib/org-service";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const material = await prisma.orgMaterial.findUnique({ where: { id } });
    if (!material || material.organizationId !== org.id) {
      throw new ApiError(404, "Material no encontrado");
    }

    await prisma.orgMaterial.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
