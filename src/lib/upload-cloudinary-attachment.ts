/**
 * Sube un archivo (PDF, Office, etc.) directamente a Cloudinary como `raw`,
 * usando firma del servidor. Evita el límite de body de Vercel al no pasar
 * el binario por /api/upload/attachment.
 */
export type CloudinaryAttachmentFolder = "cursumi/attachments" | "cursumi/materials";

export async function uploadAttachmentDirect(
  file: File,
  folder: CloudinaryAttachmentFolder,
): Promise<{ url: string }> {
  const sigRes = await fetch("/api/cloudinary/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  const sigData = (await sigRes.json().catch(() => ({}))) as {
    error?: string;
    timestamp?: number;
    signature?: string;
    cloudName?: string;
    apiKey?: string;
    folder?: string;
  };
  if (!sigRes.ok) {
    throw new Error(sigData.error || "No se pudo autorizar la subida");
  }
  const { timestamp, signature, cloudName, apiKey, folder: signedFolder } = sigData;
  if (
    timestamp == null ||
    !signature ||
    !cloudName ||
    !apiKey ||
    !signedFolder
  ) {
    throw new Error("Respuesta de firma incompleta");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", signedFolder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
    { method: "POST", body: form },
  );
  const data = (await uploadRes.json().catch(() => ({}))) as {
    error?: { message?: string };
    secure_url?: string;
  };
  if (!uploadRes.ok) {
    throw new Error(
      data.error?.message || "Error al subir el archivo a almacenamiento",
    );
  }
  if (!data.secure_url) {
    throw new Error("Respuesta sin URL del archivo");
  }
  return {
    url: data.secure_url.replace(/\/v\d+\//, "/v1/"),
  };
}
