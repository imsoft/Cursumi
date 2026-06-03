import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";

/**
 * Contenido de una lección para la app móvil (forma lean). Verifica que el usuario
 * esté inscrito en el curso de la lección (o que la lección sea gratuita).
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await context.params;
    const session = await requireSession();

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        duration: true,
        videoUrl: true,
        content: true,
        isFree: true,
        section: { select: { courseId: true } },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lección no encontrada" }, { status: 404 });
    }

    const courseId = lesson.section.courseId;

    const enrollment = await prisma.enrollment.findUnique({
      where: { courseId_studentId: { courseId, studentId: session.user.id } },
      select: { id: true, lessonProgress: { where: { lessonId }, select: { id: true } } },
    });

    if (!enrollment && !lesson.isFree) {
      return NextResponse.json({ error: "No estás inscrito en este curso" }, { status: 403 });
    }

    return NextResponse.json({
      id: lesson.id,
      courseId,
      title: lesson.title,
      description: lesson.description,
      type: lesson.type,
      duration: lesson.duration,
      videoUrl: lesson.videoUrl,
      content: lesson.content,
      completed: (enrollment?.lessonProgress.length ?? 0) > 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
