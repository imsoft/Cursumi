import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

/**
 * Genera una firma para subida client-side a Cloudinary.
 * Acepta `folder` opcional en el body para organizar archivos.
 * Carpetas válidas: cursumi/avatars, cursumi/signatures, cursumi/course-covers, cursumi/attachments, cursumi/materials
 */

const ALLOWED_FOLDERS = [
  "cursumi/avatars",
  "cursumi/signatures",
  "cursumi/course-covers",
  "cursumi/attachments",
  "cursumi/materials",
] as const;

const DEFAULT_FOLDER = "cursumi/uploads";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} no está configurada`);
  }
  return value;
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    const cloudName = requireEnv("CLOUDINARY_CLOUD_NAME");
    const apiKey = requireEnv("CLOUDINARY_API_KEY");
    const apiSecret = requireEnv("CLOUDINARY_API_SECRET");

    const body = await req.json().catch(() => ({}));
    const requestedFolder = (body as { folder?: string }).folder;

    // Validate folder — only allow known cursumi/ prefixed folders
    const folder =
      requestedFolder && (ALLOWED_FOLDERS as readonly string[]).includes(requestedFolder)
        ? requestedFolder
        : DEFAULT_FOLDER;

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = createHash("sha1")
      .update(paramsToSign + apiSecret)
      .digest("hex");

    return NextResponse.json({
      timestamp,
      signature,
      cloudName,
      apiKey,
      folder,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
