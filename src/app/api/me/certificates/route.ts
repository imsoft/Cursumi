import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireSession();

    // First try to get real certificates from DB
    const dbCerts = await prisma.certificate.findMany({
      where: { userId: session.user.id },
      orderBy: { issuedAt: "desc" },
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

    if (dbCerts.length > 0) {
      const certificates = dbCerts.map((cert) => ({
        id: cert.id,
        courseId: cert.course.id,
        courseTitle: cert.course.title,
        studentName: session.user.name || "Estudiante",
        instructorName: cert.course.instructor?.name || "Instructor",
        issueDate: cert.issuedAt.toISOString(),
        certificateNumber: cert.number,
        type: cert.type,
        category: cert.course.category,
        modality: cert.course.modality,
        hours: cert.course.duration ? parseInt(cert.course.duration, 10) || undefined : undefined,
        imageUrl: cert.course.imageUrl || null,
      }));
      return NextResponse.json(certificates);
    }

    // Fallback: derive from completed enrollments (legacy)
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
      certificateNumber: `CUR-${enrollment.id.slice(0, 8).toUpperCase()}`,
      type: "accreditation" as const,
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
