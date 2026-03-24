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

    const { courseId } = await req.json();
    if (!courseId) throw new ApiError(400, "courseId es requerido");

    // Verify org has access to this course
    const access = await prisma.orgCourseAccess.findUnique({
      where: { organizationId_courseId: { organizationId: org.id, courseId } },
    });
    if (!access) {
      throw new ApiError(400, "Tu organización no tiene acceso a este curso");
    }

    const teamCourse = await prisma.teamCourseAccess.create({
      data: { teamId, courseId },
    });

    return NextResponse.json({ teamCourse }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
