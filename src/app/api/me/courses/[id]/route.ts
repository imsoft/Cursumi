import { NextRequest, NextResponse } from "next/server";
import { getStudentCourseDetail } from "@/lib/course-service";
import { handleApiError, requireSession } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await requireSession();
    const detail = await getStudentCourseDetail(id, session.user.id);
    if (!detail) {
      return NextResponse.json({ error: "Curso no encontrado o no inscrito" }, { status: 404 });
    }
    return NextResponse.json(detail);
  } catch (error) {
    return handleApiError(error);
  }
}
