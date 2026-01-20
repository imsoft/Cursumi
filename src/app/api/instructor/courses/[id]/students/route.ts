import { NextRequest, NextResponse } from "next/server";
import { getCourseDetail, listCourseStudents } from "@/lib/course-service";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await requireSession();
    const role = await requireRole(session.user.id, ["instructor", "admin"]);

    const course = await getCourseDetail(id);
    if (!course || (course.instructorId !== session.user.id && role !== "admin")) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    const students = await listCourseStudents(id);
    return NextResponse.json(students);
  } catch (error) {
    return handleApiError(error);
  }
}
