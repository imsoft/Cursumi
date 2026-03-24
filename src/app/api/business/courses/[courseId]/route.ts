import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError, ApiError } from "@/lib/api-helpers";
import { resolveOrgAdmin } from "@/lib/org-service";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const access = await prisma.orgCourseAccess.findUnique({
      where: { organizationId_courseId: { organizationId: org.id, courseId } },
    });
    if (!access) throw new ApiError(404, "Acceso no encontrado");

    await prisma.orgCourseAccess.delete({ where: { id: access.id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
