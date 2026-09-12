import { NextRequest, NextResponse } from "next/server";
import { createMuxUploadUrl } from "@/app/actions/mux-actions";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";
import { checkRateLimitAsync } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    // Cada llamada crea una subida de video en Mux, que se factura.
    const limitado = await checkRateLimitAsync({
      key: `mux-upload-url:${session.user.id}`,
      limit: 20,
      windowSecs: 3600,
    });
    if (limitado) return limitado;
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
