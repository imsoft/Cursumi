import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";

function buildCertificateNumber(enrollmentId: string) {
  return `CUR-${enrollmentId.slice(0, 8).toUpperCase()}`;
}

export async function GET() {
  try {
    const session = await requireSession();
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: session.user.id,
        OR: [{ status: "completed" }, { progress: { gte: 100 } }],
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            modality: true,
            duration: true,
            instructor: { select: { name: true } },
            imageUrl: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const certificates = enrollments.map((enrollment) => ({
      id: enrollment.id,
      courseId: enrollment.course.id,
      courseTitle: enrollment.course.title,
      studentName: session.user.name || "Estudiante",
      instructorName: enrollment.course.instructor?.name || "Instructor",
      issueDate: enrollment.updatedAt.toISOString(),
      certificateNumber: buildCertificateNumber(enrollment.id),
      category: enrollment.course.category,
      modality: enrollment.course.modality,
      hours: enrollment.course.duration ? parseInt(enrollment.course.duration, 10) || undefined : undefined,
      imageUrl: enrollment.course.imageUrl || null,
    }));

    return NextResponse.json(certificates);
  } catch (error) {
    return handleApiError(error);
  }
}
