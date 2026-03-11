import { NextRequest, NextResponse } from "next/server";
import { getPublishedCourse } from "@/lib/course-service";
import { handleApiError } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await context.params;
    const course = await getPublishedCourse(courseId);
    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }
    return NextResponse.json(course);
  } catch (error) {
    return handleApiError(error);
  }
}
