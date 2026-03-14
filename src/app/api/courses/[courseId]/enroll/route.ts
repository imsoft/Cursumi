import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPublishedCourse } from "@/lib/course-service";
import { handleApiError, requireSession } from "@/lib/api-helpers";

export async function POST(_req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await context.params;
    const session = await requireSession();
    const course = await getPublishedCourse(courseId);
    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado o no publicado" }, { status: 404 });
    }

    // Cursos de pago solo se inscriben vía webhook de Stripe
    if (course.price > 0) {
      return NextResponse.json(
        { error: "Este curso requiere pago. Usa el flujo de checkout." },
        { status: 403 }
      );
    }

    await prisma.enrollment.upsert({
      where: {
        courseId_studentId: {
          courseId,
          studentId: session.user.id,
        },
      },
      update: { status: "active" },
      create: {
        courseId,
        studentId: session.user.id,
        status: "active",
        progress: 0,
      },
    });

    return NextResponse.json({ enrolled: true });
  } catch (error) {
    return handleApiError(error);
  }
}
