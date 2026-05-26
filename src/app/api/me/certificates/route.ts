import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { repairCertificatesForStudent } from "@/lib/enrollment-progress";

// Nunca cachear — los certificados cambian al completar cursos
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession();

    // Intentar reparar certificados faltantes, pero NO bloquear si falla
    try {
      await repairCertificatesForStudent(session.user.id);
    } catch (repairErr) {
      console.error("[certificates] repairCertificatesForStudent failed:", repairErr);
    }

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

    return NextResponse.json(certificates, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
