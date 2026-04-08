import { NextRequest, NextResponse } from "next/server";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Selecciona una imagen" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "La imagen es demasiado grande (máx. 10 MB)" }, { status: 413 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary no está configurado. Contacta al administrador." },
        { status: 500 },
      );
    }

    const folder = "cursumi/course-covers";

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("folder", folder);

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}` },
      body: uploadForm,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Cloudinary course-cover upload:", err);
      return NextResponse.json(
        { error: (err as { error?: { message?: string } }).error?.message ?? "Error al subir la imagen" },
        { status: 500 },
      );
    }

    const data = (await res.json()) as { secure_url: string; public_id: string };
    return NextResponse.json({ url: data.secure_url.replace(/\/v\d+\//, "/v1/"), publicId: data.public_id });
  } catch (error) {
    return handleApiError(error);
  }
}
