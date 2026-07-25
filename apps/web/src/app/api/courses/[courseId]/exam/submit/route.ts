import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import type { CourseFinalExam } from "@/components/instructor/course-types";
import { sendCertificateEmail } from "@/lib/email";
import { recalculateEnrollmentProgress } from "@/lib/enrollment-progress";
import { gradeExam, type ExamAnswer } from "@/lib/exam-grading";

const answerValue = z.union([z.number(), z.array(z.number()), z.array(z.string())]);
const bodySchema = z.object({
  answers: z.record(z.string(), answerValue),
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
      if (enrollment.examSubmission.passed) {
        return NextResponse.json({ error: "Ya aprobaste este examen" }, { status: 400 });
      }

      const submittedAt = new Date(enrollment.examSubmission.submittedAt);
      const diffMs = Date.now() - submittedAt.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 4) {
        const remainingMs = 4 * 60 * 60 * 1000 - diffMs;
        const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
        const remainingMinutes = Math.ceil((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        let message = "Debes esperar ";
        if (remainingHours > 0) {
          message += `${remainingHours} ${remainingHours === 1 ? "hora" : "horas"} y `;
        }
        message += `${remainingMinutes} ${remainingMinutes === 1 ? "minuto" : "minutos"} para volver a realizar el examen.`;
        return NextResponse.json({ error: message }, { status: 429 });
      }
    }

    // Fetch exam definition to compute score server-side (never trust client)
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { finalExam: true, title: true },
    });
    const finalExam = course?.finalExam as CourseFinalExam | null;

    if (!finalExam) {
      return NextResponse.json({ error: "Este curso no tiene examen final configurado" }, { status: 400 });
    }

    // Calificación server-side (nunca se confía en el cliente). Soporta todos los
    // tipos: multiple-choice, true-false, checkbox, ordering y matching. Los tipos
    // sin respuesta correcta (short-answer) se omiten. Si no hay preguntas
    // auto-calificables, se aprueba automáticamente.
    const { evaluations, score, passed } = gradeExam(
      finalExam.questions,
      body.answers as Record<string, ExamAnswer>,
      finalExam.passingScore,
    );

    let submission;
    if (enrollment.examSubmission) {
      submission = await prisma.examSubmission.update({
        where: { enrollmentId: enrollment.id },
        data: {
          answers: body.answers,
          score,
          passed,
          submittedAt: new Date(),
        },
      });
    } else {
      submission = await prisma.examSubmission.create({
        data: {
          enrollmentId: enrollment.id,
          answers: body.answers,
          score,
          passed,
        },
      });
    }

    // Recalcular progreso (genera certificado + notificación + marca completado si llega a 100%)
    await recalculateEnrollmentProgress(enrollment.id, courseId);

    // Email de certificado
    const certificate = await prisma.certificate.findUnique({
      where: { enrollmentId: enrollment.id },
    });

    if (certificate && course?.title && session.user.email) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await sendCertificateEmail({
        to: session.user.email,
        name: session.user.name || "Estudiante",
        courseTitle: course.title,
        certificateUrl: `${baseUrl}/dashboard/certificates/${certificate.id}`,
      });
    }

    return NextResponse.json({
      score: submission.score,
      passed: submission.passed,
      evaluations,
      certificate: certificate ? { id: certificate.id, number: certificate.number } : null,
      submittedAt: submission.submittedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
