import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
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

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "cursumi/course-covers";
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = createHash("sha1").update(paramsToSign + apiSecret).digest("hex");

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("api_key", apiKey);
    uploadForm.append("timestamp", timestamp.toString());
    uploadForm.append("signature", signature);
    uploadForm.append("folder", folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
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
    return NextResponse.json({ url: data.secure_url.replace(/\/v\d+\//, "/"), publicId: data.public_id });
  } catch (error) {
    return handleApiError(error);
  }
}
