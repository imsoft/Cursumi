import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { sanitizeExamForClient } from "@/lib/course-service";
import type { CourseFinalExam } from "@/components/instructor/course-types";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await requireSession();
    const { courseId } = await context.params;

    // Check if the user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: session.user.id,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Fetch the exam from the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { finalExam: true },
    });

    const finalExam = course?.finalExam as CourseFinalExam | null;

    if (!finalExam) {
      return NextResponse.json(
        { error: "El curso no tiene un examen final configurado." },
        { status: 404 }
      );
    }

    // Return the sanitized exam so no correct answers are exposed
    return NextResponse.json(sanitizeExamForClient(finalExam));
  } catch (error) {
    return handleApiError(error);
  }
}
