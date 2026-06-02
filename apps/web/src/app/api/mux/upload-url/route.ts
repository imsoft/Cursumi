import { NextRequest, NextResponse } from "next/server";
import { createMuxUploadUrl } from "@/app/actions/mux-actions";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);
    const body = await req.json().catch(() => ({}));
    const { courseId, lessonId, lessonTitle } = body as {
      courseId?: string;
      lessonId?: string;
      lessonTitle?: string;
    };
    // Usar el origen de la request para CORS correcto en el upload de Mux
    const origin = req.headers.get("origin") ?? "https://www.cursumi.com";
    const upload = await createMuxUploadUrl(origin, { courseId, lessonId, lessonTitle });
    return NextResponse.json(upload);
  } catch (error) {
    return handleApiError(error);
  }
}
