import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { recalculateEnrollmentProgress } from "@/lib/enrollment-progress";
import { parseLessonQuiz, gradeLessonQuiz } from "@/lib/lesson-quiz";
import type { ExamAnswer } from "@/lib/exam-grading";

export async function POST(req: NextRequest, context: { params: Promise<{ lessonId: string }> }) {
  try {
    const { lessonId } = await context.params;
    const session = await requireSession();
    const body = await req.json().catch(() => ({}));
    const courseId = body.courseId as string | undefined;

    if (!courseId) {
      return NextResponse.json({ error: "courseId es requerido" }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: session.user.id,
        },
      },
      select: { id: true, status: true },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "No estás inscrito en este curso" }, { status: 403 });
    }

    // Verificar que la lección pertenezca al curso (evita marcar lecciones de otros cursos)
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, section: { courseId } },
      select: { id: true, type: true, content: true },
    });
    if (!lesson) {
      return NextResponse.json({ error: "Lección no encontrada en este curso" }, { status: 404 });
    }

    const answers = body.answers != null ? body.answers : undefined;

    // ── Quiz: la nota la calcula el servidor ────────────────────────────────
    // El cliente solo manda las respuestas. La calificación sale del `content`
    // que está en la base, no de lo que diga el navegador: antes se aceptaba un
    // `score` del cuerpo de la petición y cualquiera podía ponerse un 100.
    let quizResult: ReturnType<typeof gradeLessonQuiz> | null = null;
    let score: number | undefined;

    if (lesson.type === "quiz") {
      const quiz = parseLessonQuiz(lesson.content);
      if (quiz.questions.length > 0) {
        quizResult = gradeLessonQuiz(
          quiz,
          (answers ?? {}) as Record<string, ExamAnswer>,
        );
        score = quizResult.score;

        // Si el quiz exige aprobar, no se marca como completada hasta lograrlo.
        // Antes esa decisión la tomaba el navegador.
        if (quiz.passingRequired && !quizResult.passed) {
          return NextResponse.json({
            quiz: quizResult,
            completed: false,
          });
        }
      }
    }

    await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      update: {
        ...(score !== undefined && { score }),
        ...(answers !== undefined && { answers }),
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        ...(score !== undefined && { score }),
        ...(answers !== undefined && { answers }),
      },
    });

    // Recalcular progreso (marca completado y genera certificado si llega a 100%)
    const progress = await recalculateEnrollmentProgress(enrollment.id, courseId);

    const totalLessons = await prisma.lesson.count({
      where: { section: { courseId } },
    });
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId: enrollment.id,
        lesson: { section: { courseId } },
      },
    });

    return NextResponse.json({
      progress,
      completedLessons,
      totalLessons,
      completed: true,
      // Las respuestas correctas viajan SOLO aquí, ya contestado el quiz,
      // para poder pintar la revisión sin regalarlas antes de tiempo.
      ...(quizResult ? { quiz: quizResult } : {}),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
