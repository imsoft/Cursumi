import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireSession();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { signatureUrl: true },
    });
    return NextResponse.json({ url: user?.signatureUrl || null });
  } catch (error) {
    return handleApiError(error);
  }
}

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Selecciona una imagen" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "La imagen es demasiado grande (máx. 4 MB)" }, { status: 413 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    let imageUrl: string;

    if (cloudName && apiKey && apiSecret) {
      const timestamp = Math.round(Date.now() / 1000);
      const folder = "cursumi/signatures";
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
        console.error("Cloudinary signature upload:", err);
        return NextResponse.json(
          { error: (err as { error?: { message?: string } }).error?.message ?? "Error al subir la firma" },
          { status: 500 },
        );
      }

      const data = (await res.json()) as { secure_url: string };
      imageUrl = data.secure_url.replace(/\/v\d+\//, "/");
    } else {
      const buf = Buffer.from(await file.arrayBuffer());
      const mime = file.type || "image/png";
      const base64 = `data:${mime};base64,${buf.toString("base64")}`;
      if (base64.length > 950_000) {
        return NextResponse.json(
          { error: "La imagen es muy grande. Configura Cloudinary o elige otra imagen." },
          { status: 413 },
        );
      }
      imageUrl = base64;
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { signatureUrl: imageUrl },
      select: { id: true },
    });

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const session = await requireSession();
    await prisma.user.update({
      where: { id: session.user.id },
      data: { signatureUrl: null },
      select: { id: true },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
