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
      select: { id: true },
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
    const completedLessons = await prisma.lessonProgress.count({
      where: { enrollmentId: enrollment.id },
    });

    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { progress },
    });

    return NextResponse.json({ progress, completedLessons, totalLessons });
  } catch (error) {
    return handleApiError(error);
  }
}
