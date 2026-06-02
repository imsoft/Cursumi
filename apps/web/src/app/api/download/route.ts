import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy de descarga para archivos en CDNs externos (Cloudinary, etc.).
 * El atributo HTML `download` no funciona con URLs cross-origin,
 * así que este endpoint descarga el archivo y lo re-sirve con el
 * Content-Disposition correcto para forzar el nombre original.
 *
 * GET /api/download?url=<encoded_url>&name=<filename>
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const name = req.nextUrl.searchParams.get("name");

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  // Only allow downloading from trusted domains
  const allowed = ["res.cloudinary.com", "cloudinary.com"];
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!allowed.some((d) => parsedUrl.hostname.endsWith(d))) {
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

  const filename = name || url.split("/").pop() || "download";

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "'")}"`,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
