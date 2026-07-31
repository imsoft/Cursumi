import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { recalculateEnrollmentProgress } from "@/lib/enrollment-progress";

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

    // OJO: este `score` lo manda el cliente. A diferencia del examen final y de
    // los cierres de sección —que sí se califican en el servidor—, el quiz de
    // lección todavía se califica en el navegador, así que un alumno puede
    // ponerse la nota que quiera. No abre la puerta al certificado (ese depende
    // del examen y de los cierres, ambos calificados aquí), pero sí ensucia las
    // calificaciones y las analíticas del instructor.
    // Mientras se mueve la calificación al servidor, al menos lo acotamos a un
    // rango con sentido para que no entren valores absurdos ni negativos.
    const rawScore = typeof body.score === "number" && Number.isFinite(body.score)
      ? body.score
      : undefined;
    const score = rawScore === undefined
      ? undefined
      : Math.min(100, Math.max(0, Math.round(rawScore)));
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

    return NextResponse.json({ progress, completedLessons, totalLessons });
  } catch (error) {
    return handleApiError(error);
  }
}
