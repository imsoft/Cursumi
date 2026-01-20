import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";

function buildCertificateNumber(enrollmentId: string) {
  return `CUR-${enrollmentId.slice(0, 8).toUpperCase()}`;
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await requireSession();

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id,
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
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 });
    }

    const certificate = {
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
    };

    return NextResponse.json(certificate);
  } catch (error) {
    return handleApiError(error);
  }
}
