import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";

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

    await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      update: {},
      create: {
        enrollmentId: enrollment.id,
        lessonId,
      },
    });

    const totalLessons = await prisma.lesson.count({
      where: { section: { courseId } },
    });
    // Solo contar progreso de lecciones que aún existen en el curso
    // (evita que progress > 100% si el instructor eliminó lecciones)
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId: enrollment.id,
        lesson: { section: { courseId } },
      },
    });

    const progress = totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 0;

    // Si el progreso llega al 100% y el enrollment no está ya completado,
    // revisar si el curso tiene examen final. Si no tiene, marcar como completado.
    let newStatus = enrollment.status;
    if (progress === 100 && enrollment.status !== "completed") {
      const courseData = await prisma.course.findUnique({
        where: { id: courseId },
        select: { finalExam: true },
      });
      const hasFinalExam = courseData?.finalExam !== null && courseData?.finalExam !== undefined;
      if (!hasFinalExam) {
        newStatus = "completed";
      }
    }

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { progress, ...(newStatus !== enrollment.status ? { status: newStatus } : {}) },
    });

    return NextResponse.json({ progress, completedLessons, totalLessons });
  } catch (error) {
    return handleApiError(error);
  }
}
