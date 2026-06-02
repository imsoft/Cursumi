import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError } from "@/lib/api-helpers";
import { resolveOrgAdmin } from "@/lib/org-service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const enrollments = await prisma.enrollment.findMany({
      where: { organizationId: org.id, courseId },
      include: {
        student: { select: { id: true, name: true, email: true, image: true } },
        certificate: { select: { id: true, issuedAt: true } },
      },
    });

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, imageUrl: true },
    });

    const students = enrollments.map((e) => ({
      userId: e.student.id,
      name: e.student.name,
      email: e.student.email,
      image: e.student.image,
      progress: e.progress,
      status: e.status,
      hasCertificate: !!e.certificate,
      enrolledAt: e.createdAt,
    }));

    const avgProgress = students.length > 0
      ? Math.round(students.reduce((s, e) => s + e.progress, 0) / students.length)
      : 0;

    return NextResponse.json({
      course,
      students,
      avgProgress,
      totalStudents: students.length,
      completed: students.filter((s) => s.status === "completed").length,
      certificates: students.filter((s) => s.hasCertificate).length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
