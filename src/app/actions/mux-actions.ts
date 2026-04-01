"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const MUX_UPLOAD_ENDPOINT = "https://api.mux.com/video/v1/uploads";
const MUX_ASSETS_ENDPOINT = "https://api.mux.com/video/v1/assets";

type MuxUploadResponse = {
  data: {
    id: string;
    url: string;
    status: string;
  };
};

function requireMuxEnv() {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    throw new Error("MUX_TOKEN_ID y MUX_TOKEN_SECRET son requeridos");
  }
  return { tokenId, tokenSecret };
}

async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("No autenticado");
  }
  return session;
}

/**
 * Crea un URL de carga directa en Mux para subir videos desde el cliente.
 * Retorna upload URL e ID; debes usarlo con fetch PUT desde el frontend.
 *
 * @param corsOrigin — dominio permitido para CORS
 * @param metadata — info para identificar el video en el dashboard de Mux
 */
export async function createMuxUploadUrl(
  corsOrigin = "*",
  metadata?: { courseId?: string; lessonId?: string; lessonTitle?: string },
) {
  await requireSession(); // asegurar usuario
  const { tokenId, tokenSecret } = requireMuxEnv();

  const authHeader = Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64");

  // passthrough es un string libre que aparece en el dashboard de Mux
  const passthrough = metadata
    ? JSON.stringify({
        platform: "cursumi",
        courseId: metadata.courseId,
        lessonId: metadata.lessonId,
        lessonTitle: metadata.lessonTitle,
      })
    : JSON.stringify({ platform: "cursumi" });

  const response = await fetch(MUX_UPLOAD_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cors_origin: corsOrigin,
      new_asset_settings: {
        playback_policy: ["public"],
        passthrough,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mux error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as MuxUploadResponse;
  return {
    uploadId: data.data.id,
    uploadUrl: data.data.url,
    status: data.data.status,
  };
}

/**
 * Obtiene el playback_id real de Mux a partir de un uploadId.
 * Nota: el asset puede tardar en estar listo; idealmente se debería hacer polling.
 */
export async function getMuxPlaybackId(uploadId: string) {
  await requireSession();
  const { tokenId, tokenSecret } = requireMuxEnv();
  const authHeader = Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64");

  const uploadRes = await fetch(`${MUX_UPLOAD_ENDPOINT}/${uploadId}`, {
    headers: { Authorization: `Basic ${authHeader}` },
    cache: "no-store",
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Mux upload lookup error: ${errorText}`);
  }

  const uploadData = (await uploadRes.json()) as {
    data: { asset_id?: string | null };
  };

  const assetId = uploadData.data.asset_id;
  if (!assetId) {
    throw new Error("Asset aún no disponible para este upload");
  }

  const assetRes = await fetch(`${MUX_ASSETS_ENDPOINT}/${assetId}`, {
    headers: { Authorization: `Basic ${authHeader}` },
    cache: "no-store",
  });

  if (!assetRes.ok) {
    const errorText = await assetRes.text();
    throw new Error(`Mux asset lookup error: ${errorText}`);
  }

  const assetData = (await assetRes.json()) as {
    data: { playback_ids?: { id: string }[] };
  };

  const playbackId = assetData.data.playback_ids?.[0]?.id;
  if (!playbackId) {
    throw new Error("Playback ID no disponible aún");
  }

  return {
    playbackId,
    playbackUrl: `https://stream.mux.com/${playbackId}.m3u8`,
  };
}
