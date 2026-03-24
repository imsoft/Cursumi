import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await requireSession();

    // Try to find by certificate ID first
    const dbCert = await prisma.certificate.findFirst({
      where: { id, userId: session.user.id },
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

    if (dbCert) {
      return NextResponse.json({
        id: dbCert.id,
        courseId: dbCert.course.id,
        courseTitle: dbCert.course.title,
        studentName: session.user.name || "Estudiante",
        instructorName: dbCert.course.instructor?.name || "Instructor",
        issueDate: dbCert.issuedAt.toISOString(),
        certificateNumber: dbCert.number,
        type: dbCert.type,
        category: dbCert.course.category,
        modality: dbCert.course.modality,
        hours: dbCert.course.duration ? parseInt(dbCert.course.duration, 10) || undefined : undefined,
        imageUrl: dbCert.course.imageUrl || null,
      });
    }

    // Fallback: look up by enrollment ID (legacy)
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

    return NextResponse.json({
      id: enrollment.id,
      courseId: enrollment.course.id,
      courseTitle: enrollment.course.title,
      studentName: session.user.name || "Estudiante",
      instructorName: enrollment.course.instructor?.name || "Instructor",
      issueDate: enrollment.updatedAt.toISOString(),
      certificateNumber: `CUR-${enrollment.id.slice(0, 8).toUpperCase()}`,
      type: "accreditation" as const,
      category: enrollment.course.category,
      modality: enrollment.course.modality,
      hours: enrollment.course.duration ? parseInt(enrollment.course.duration, 10) || undefined : undefined,
      imageUrl: enrollment.course.imageUrl || null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
