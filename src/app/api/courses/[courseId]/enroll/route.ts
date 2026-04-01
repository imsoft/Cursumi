import { NextRequest, NextResponse } from "next/server";
import { getPublishedCourse } from "@/lib/course-service";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { enrollInCourse } from "@/app/actions/course-actions";

export async function POST(req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await context.params;
    await requireSession();
    const course = await getPublishedCourse(courseId);
    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado o no publicado" }, { status: 404 });
    }

    if (course.price > 0) {
      return NextResponse.json(
        { error: "Este curso requiere pago. Usa el flujo de checkout." },
        { status: 403 }
      );
    }

    let body: { sessionId?: string; joinCode?: string } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch {
      /* form sin JSON */
    }
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : undefined;
    const joinCode = typeof body.joinCode === "string" ? body.joinCode : undefined;

    await enrollInCourse(courseId, sessionId, joinCode);

    return NextResponse.json({ enrolled: true });
  } catch (error) {
    return handleApiError(error);
  }
}
