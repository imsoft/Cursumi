import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { recalculateProgress } from "@/app/actions/progress-actions";

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
      select: { id: true },
    });
    if (!lesson) {
      return NextResponse.json({ error: "Lección no encontrada en este curso" }, { status: 404 });
    }

    const score = typeof body.score === "number" ? body.score : undefined;
    const answers = body.answers != null ? body.answers : undefined;

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

    // Recalcular progreso incluyendo lecciones, gates de sección y examen final
    const progress = await recalculateProgress(enrollment.id, courseId);

    // Si el progreso llega al 100% y el enrollment no está ya completado, marcar como completado
    if (progress === 100 && enrollment.status !== "completed") {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { status: "completed" },
      });
    }

    const totalLessons = await prisma.lesson.count({
      where: { section: { courseId } },
    });
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId: enrollment.id,
        lesson: { section: { courseId } },
      },
    });

    return NextResponse.json({ progress, completedLessons, totalLessons });
  } catch (error) {
    return handleApiError(error);
  }
}
