import { NextRequest, NextResponse } from "next/server";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { authorizeCloudinaryUploader } from "@/lib/authorize-cloudinary-uploader";
import { prisma } from "@/lib/prisma";
import { validateAttachmentUpload } from "@/lib/upload-validation";

const MAX_BYTES = 10 * 1024 * 1024;

async function resolveFolder(userId: string, courseId?: string): Promise<string> {
  if (!courseId) return "cursumi/attachments";

  const course = await prisma.course.findFirst({
    where: { id: courseId, instructorId: userId },
    select: { id: true },
  });
  return course ? `cursumi/courses/${courseId}/attachments` : "cursumi/attachments";
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await authorizeCloudinaryUploader(session.user.id);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }
    // Allowlist por magic bytes: imágenes, PDF o documentos (bloquea HTML/SVG/ejecutables).
    const invalid = await validateAttachmentUpload(file, MAX_BYTES);
    if (invalid) {
      return NextResponse.json({ error: invalid.message }, { status: invalid.status });
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

    const courseId = req.nextUrl.searchParams.get("courseId") ?? undefined;
    const folder = await resolveFolder(session.user.id, courseId);

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
      const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
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
