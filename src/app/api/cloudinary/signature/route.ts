import { NextResponse } from "next/server";
import crypto from "crypto";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} no está configurada`);
  }
  return value;
}

export async function POST() {
  try {
    const cloudName = requireEnv("CLOUDINARY_CLOUD_NAME");
    const apiKey = requireEnv("CLOUDINARY_API_KEY");
    const apiSecret = requireEnv("CLOUDINARY_API_SECRET");
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "unsigned";

    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = `timestamp=${timestamp}&upload_preset=${uploadPreset}`;
    const signature = crypto.createHash("sha1").update(paramsToSign + apiSecret).digest("hex");

    return NextResponse.json({
      timestamp,
      signature,
      cloudName,
      apiKey,
      uploadPreset,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo generar la firma" },
      { status: 500 },
    );
  }
}
