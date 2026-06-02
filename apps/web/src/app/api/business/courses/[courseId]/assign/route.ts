import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError, ApiError } from "@/lib/api-helpers";
import { resolveOrgAdmin } from "@/lib/org-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    // Verify org has access to this course
    const access = await prisma.orgCourseAccess.findUnique({
      where: { organizationId_courseId: { organizationId: org.id, courseId } },
    });
    if (!access) throw new ApiError(400, "Tu organización no tiene acceso a este curso");

    const { memberIds } = (await req.json()) as { memberIds: string[] };
    if (!memberIds?.length) throw new ApiError(400, "memberIds es requerido");

    // Verify all members belong to org
    const members = await prisma.orgMember.findMany({
      where: { id: { in: memberIds }, organizationId: org.id },
      select: { userId: true },
    });

    if (members.length === 0) throw new ApiError(400, "No se encontraron miembros válidos");

    await prisma.enrollment.createMany({
      data: members.map((m) => ({
        courseId,
        studentId: m.userId,
        organizationId: org.id,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ assigned: members.length });
  } catch (error) {
    return handleApiError(error);
  }
}
