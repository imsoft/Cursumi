import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import type { CourseFinalExam } from "@/components/instructor/course-types";
import { sendCertificateEmail } from "@/lib/email";
import { recalculateProgress } from "@/app/actions/progress-actions";

const bodySchema = z.object({
  answers: z.record(z.string(), z.number()),
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

    // Fetch exam definition to compute score server-side (never trust client)
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { finalExam: true, title: true },
    });
    const finalExam = course?.finalExam as CourseFinalExam | null;

    if (!finalExam) {
      return NextResponse.json({ error: "Este curso no tiene examen final configurado" }, { status: 400 });
    }

    // Compute score server-side. Solo se cuentan preguntas con correctAnswer definido
    // (multiple-choice y true-false). Las short-answer sin correctAnswer se omiten
    // porque no pueden calificarse automáticamente.
    // Si no hay preguntas auto-calificables, se otorga puntaje completo (100).
    let totalPoints = 0;
    let earnedPoints = 0;
    const evaluations: Record<string, boolean> = {};

    for (const question of finalExam.questions) {
      if (question.correctAnswer === undefined) continue; // omitir no auto-calificables
      const pts = Math.max(1, question.points ?? 1); // tratar points=0 como 1
      totalPoints += pts;
      const userAnswer = body.answers[question.id];
      const isCorrect = userAnswer !== undefined && userAnswer === question.correctAnswer;
      
      evaluations[question.id] = isCorrect;
      
      if (isCorrect) {
        earnedPoints += pts;
      }
    }
    // Si todas las preguntas son manuales (totalPoints=0), pasan automáticamente
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 100;
    const passed = score >= finalExam.passingScore;

    const submission = await prisma.examSubmission.create({
      data: {
        enrollmentId: enrollment.id,
        answers: body.answers,
        score,
        passed,
      },
    });

    // Recalcular progreso (genera certificado + notificación + marca completado si llega a 100%)
    await recalculateProgress(enrollment.id, courseId);

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
    });
  } catch (error) {
    return handleApiError(error);
  }
}
