import { NextRequest, NextResponse } from "next/server";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { checkRateLimitAsync } from "@/lib/rate-limit";

/**
 * Proxy de descarga para archivos en CDNs externos (Cloudinary, etc.).
 * El atributo HTML `download` no funciona con URLs cross-origin,
 * así que este endpoint descarga el archivo y lo re-sirve con el
 * Content-Disposition correcto para forzar el nombre original.
 *
 * GET /api/download?url=<encoded_url>&name=<filename>
 *
 * Pide sesión: el único que lo usa es el visor de lecciones, que ya exige
 * inscripción. Sin sesión esto era un proxy abierto que cualquiera podía usar
 * para sacar tráfico (y contenido) a través de nuestro dominio.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();

    const limited = await checkRateLimitAsync({
      key: `download:${session.user.id}`,
      limit: 60,
      windowSecs: 60,
    });
    if (limited) return limited;

    return await servirDescarga(req);
  } catch (error) {
    return handleApiError(error);
  }
}

async function servirDescarga(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const name = req.nextUrl.searchParams.get("name");

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  // Solo dominios de confianza.
  //
  // El host tiene que coincidir EXACTO o ser un subdominio real (terminar en
  // ".cloudinary.com"). Antes se usaba endsWith("cloudinary.com") a secas, que
  // también acepta "evil-cloudinary.com" o "micloudinary.com": basta con
  // registrar uno de esos dominios para que este endpoint sirva el contenido
  // del atacante desde cursumi.com.
  const allowed = ["cloudinary.com"];
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (parsedUrl.protocol !== "https:") {
    return NextResponse.json({ error: "Solo se permite https" }, { status: 400 });
  }

  const host = parsedUrl.hostname.toLowerCase();
  const permitido = allowed.some((d) => host === d || host.endsWith(`.${d}`));
  if (!permitido) {
    return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
  }

  const upstream = await fetch(url);
  if (!upstream.ok) {
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });
  }

  const rawContentType = upstream.headers.get("content-type") || "application/octet-stream";
  // Normalize: strip params like "; charset=utf-8"
  const mimeType = rawContentType.split(";")[0].trim().toLowerCase();

  // Whitelist of allowed MIME types for downloadable course materials
  const ALLOWED_MIME_TYPES = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ]);

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 415 });
  }

  // El nombre va a una cabecera: fuera comillas y caracteres de control
  // (evita partir la respuesta e inyectar cabeceras propias).
  const filename =
    (name || url.split("/").pop() || "download")
      .replace(/[\u0000-\u001f\u007f"]/g, "")
      .slice(0, 200) || "download";

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "'")}"`,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
