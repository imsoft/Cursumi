import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import type { CourseFinalExam } from "@/components/instructor/course-types";
import { sendCertificateEmail } from "@/lib/email";

const bodySchema = z.object({
  answers: z.record(z.string(), z.number()),
  score: z.number().min(0).max(100),
  passed: z.boolean(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await requireSession();
    const { courseId } = await params;
    const body = bodySchema.parse(await req.json());

    const enrollment = await prisma.enrollment.findUnique({
      where: { courseId_studentId: { courseId, studentId: session.user.id } },
      include: { examSubmission: true },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "No estás inscrito en este curso" }, { status: 403 });
    }

    if (enrollment.examSubmission) {
      return NextResponse.json({ error: "Ya enviaste el examen" }, { status: 409 });
    }

    const submission = await prisma.examSubmission.create({
      data: {
        enrollmentId: enrollment.id,
        answers: body.answers,
        score: Math.round(body.score),
        passed: body.passed,
      },
    });

    let certificate = null;
    if (body.passed) {
      // Check if already has a certificate
      const existing = await prisma.certificate.findUnique({
        where: { enrollmentId: enrollment.id },
      });

      if (!existing) {
        const course = await prisma.course.findUnique({
          where: { id: courseId },
          select: { finalExam: true },
        });
        const finalExam = course?.finalExam as CourseFinalExam | null;

        // Only issue certificate if exam passing score met
        if (!finalExam || body.score >= finalExam.passingScore) {
          const certNumber = `CUR-${Date.now().toString(36).toUpperCase()}`;
          certificate = await prisma.certificate.create({
            data: {
              enrollmentId: enrollment.id,
              userId: session.user.id,
              courseId,
              number: certNumber,
            },
          });

          // Update enrollment progress to 100 if exam passed
          await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { progress: 100, status: "completed" },
          });

          // Notify the student
          await prisma.notification.create({
            data: {
              userId: session.user.id,
              type: "certificate",
              title: "Certificado generado",
              body: "Has aprobado el examen final. Tu certificado ya está disponible.",
              link: `/dashboard/certificates/${certificate.id}`,
            },
          });

          // Email de certificado
          const courseData = await prisma.course.findUnique({
            where: { id: courseId },
            select: { title: true },
          });
          if (courseData && session.user.email) {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            await sendCertificateEmail({
              to: session.user.email,
              name: session.user.name || "Estudiante",
              courseTitle: courseData.title,
              certificateUrl: `${baseUrl}/dashboard/certificates/${certificate.id}`,
            });
          }
        }
      }
    }

    return NextResponse.json({
      score: submission.score,
      passed: submission.passed,
      certificate: certificate ? { id: certificate.id, number: certificate.number } : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
