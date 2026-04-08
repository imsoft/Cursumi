import { NextRequest, NextResponse } from "next/server";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

const ALLOWED_FOLDERS: Record<string, string> = {
  attachments: "cursumi/attachments",
  materials: "cursumi/materials",
};

/** Límite alineado con portadas de curso; Vercel Hobby corta el body ~4.5 MB antes del handler. */
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "El archivo está vacío" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `El archivo es demasiado grande (máx. ${MAX_BYTES / (1024 * 1024)} MB)` },
        { status: 413 },
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Almacenamiento de archivos no configurado. Contacta al administrador." },
        { status: 500 },
      );
    }

    const folderKey = req.nextUrl.searchParams.get("folder") || "attachments";
    const folder = ALLOWED_FOLDERS[folderKey] || "cursumi/attachments";

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("folder", folder);

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}` },
      body: uploadForm,
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      console.error("[upload/attachment] Cloudinary:", res.status, err);
      return NextResponse.json(
        { error: err.error?.message ?? "Error al subir el archivo a almacenamiento" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { secure_url: string; public_id: string };
    return NextResponse.json({
      url: data.secure_url.replace(/\/v\d+\//, "/v1/"),
      publicId: data.public_id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
