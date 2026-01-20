import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPublishedCourse } from "@/lib/course-service";
import { handleApiError, requireSession } from "@/lib/api-helpers";

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await requireSession();
    const course = await getPublishedCourse(id);
    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado o no publicado" }, { status: 404 });
    }

    await prisma.enrollment.upsert({
      where: {
        courseId_studentId: {
          courseId: id,
          studentId: session.user.id,
        },
      },
      update: { status: "active" },
      create: {
        courseId: id,
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
