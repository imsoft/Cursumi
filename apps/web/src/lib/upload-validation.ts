/**
 * Validación server-side de archivos subidos.
 *
 * No confiamos en `file.type` (el MIME lo declara el cliente y es falsificable):
 * leemos los primeros bytes y verificamos la "firma" real del archivo (magic
 * numbers). Esto bloquea, por ejemplo, un script renombrado a .png o un SVG con
 * JavaScript embebido subido como "image/png".
 */

export type DetectedKind =
  | "jpeg"
  | "png"
  | "gif"
  | "webp"
  | "pdf"
  | "zip" // docx/xlsx/pptx/zip comparten esta firma (PK)
  | null;

/** Detecta el tipo real a partir de los magic bytes de la cabecera. */
export function sniffKind(bytes: Uint8Array): DetectedKind {
  const b = bytes;
  // JPEG: FF D8 FF
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) return "png";
  // GIF: "GIF8"
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return "gif";
  // WEBP: "RIFF"...."WEBP"
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) return "webp";
  // PDF: "%PDF"
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return "pdf";
  // ZIP / OOXML (docx, xlsx, pptx): "PK\x03\x04"
  if (b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04) return "zip";
  return null;
}

const RASTER_IMAGE_KINDS: DetectedKind[] = ["jpeg", "png", "gif", "webp"];

export interface UploadValidationError {
  status: number;
  message: string;
}

/** Lee los primeros bytes del File (Web API) como Uint8Array. */
async function readHeader(file: File, length = 16): Promise<Uint8Array> {
  const slice = file.slice(0, length);
  const buf = await slice.arrayBuffer();
  return new Uint8Array(buf);
}

/**
 * Valida una imagen real (raster): tamaño y firma de bytes. Rechaza SVG y
 * cualquier cosa cuyos bytes no correspondan a jpeg/png/gif/webp.
 * Devuelve `null` si es válida, o un error `{ status, message }`.
 */
export async function validateImageUpload(
  file: File,
  maxBytes: number,
): Promise<UploadValidationError | null> {
  if (file.size === 0) return { status: 400, message: "El archivo está vacío" };
  if (file.size > maxBytes) {
    return {
      status: 413,
      message: `La imagen es demasiado grande (máx. ${Math.round(maxBytes / (1024 * 1024))} MB)`,
    };
  }
  const header = await readHeader(file);
  const kind = sniffKind(header);
  if (!kind || !RASTER_IMAGE_KINDS.includes(kind)) {
    return {
      status: 415,
      message: "El archivo no es una imagen válida (solo JPG, PNG, WEBP o GIF).",
    };
  }
  return null;
}

/**
 * Valida un archivo adjunto contra una allowlist de tipos seguros por firma de
 * bytes (imágenes, PDF y documentos OOXML/ZIP). Bloquea ejecutables, HTML, SVG
 * y cualquier firma no reconocida.
 */
export async function validateAttachmentUpload(
  file: File,
  maxBytes: number,
): Promise<UploadValidationError | null> {
  if (file.size === 0) return { status: 400, message: "El archivo está vacío" };
  if (file.size > maxBytes) {
    return {
      status: 413,
      message: `El archivo es demasiado grande (máx. ${Math.round(maxBytes / (1024 * 1024))} MB)`,
    };
  }
  const header = await readHeader(file);
  const kind = sniffKind(header);
  // Tipos permitidos para adjuntos de lección/material.
  const allowed: DetectedKind[] = ["jpeg", "png", "gif", "webp", "pdf", "zip"];
  if (!kind || !allowed.includes(kind)) {
    return {
      status: 415,
      message: "Tipo de archivo no permitido. Usa imágenes, PDF o documentos (docx, xlsx, pptx, zip).",
    };
  }
  return null;
}
