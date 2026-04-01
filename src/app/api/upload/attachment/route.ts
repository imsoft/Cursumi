import { NextRequest, NextResponse } from "next/server";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

const ALLOWED_FOLDERS: Record<string, string> = {
  attachments: "cursumi/attachments",
  materials: "cursumi/materials",
};

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Cloudinary no configurado" }, { status: 500 });
    }

    const folderKey = req.nextUrl.searchParams.get("folder") || "attachments";
    const folder = ALLOWED_FOLDERS[folderKey] || "cursumi/attachments";
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const { createHash } = await import("crypto");
    const signature = createHash("sha1").update(paramsToSign + apiSecret).digest("hex");

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("api_key", apiKey);
    uploadForm.append("timestamp", timestamp.toString());
    uploadForm.append("signature", signature);
    uploadForm.append("folder", folder);
    uploadForm.append("resource_type", "raw"); // Para PDFs y archivos no imagen

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
      method: "POST",
      body: uploadForm,
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.error?.message ?? "Error al subir" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ url: data.secure_url.replace(/\/v\d+\//, "/v1/"), publicId: data.public_id });
  } catch (error) {
    return handleApiError(error);
  }
}
