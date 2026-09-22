/**
 * Envío de notificaciones push a la app nativa de Android vía Firebase Cloud
 * Messaging (API HTTP v1), sin SDK: JWT RS256 firmado con la cuenta de servicio
 * → token OAuth2 → POST a fcm.googleapis.com.
 *
 * Los tokens de dispositivo se guardan en `PushToken` con el prefijo `fcm:`.
 *
 * Variable de entorno:
 *   FCM_SERVICE_ACCOUNT — el JSON completo de la cuenta de servicio de Firebase
 *   (Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada).
 *
 * Sin esa variable no se envía nada. Mismo contrato silencioso que web-push y
 * APNs: nunca lanza, fire-and-forget.
 */
import { createSign } from "node:crypto";
import { prisma } from "./prisma";
import type { PushPayload } from "./web-push";

export const FCM_TOKEN_PREFIX = "fcm:";

export function isFcmToken(token: string): boolean {
  return /^fcm:[A-Za-z0-9_:\-]{20,}$/.test(token);
}

export interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
  token_uri?: string;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function readServiceAccount(raw = process.env.FCM_SERVICE_ACCOUNT): ServiceAccount | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ServiceAccount>;
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) return null;
    return parsed as ServiceAccount;
  } catch {
    return null;
  }
}

/** JWT RS256 con el que se pide el token OAuth2 (alcance de FCM). */
export function buildGoogleJwt(account: ServiceAccount, now = Math.floor(Date.now() / 1000)): string {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: account.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: account.token_uri ?? "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(account.private_key.replace(/\\n/g, "\n"));
  return `${header}.${claims}.${base64url(signature)}`;
}

/** Cuerpo del mensaje FCM v1. `data.url` lo usa la app para abrir la pantalla. */
export function buildFcmMessage(deviceToken: string, payload: PushPayload) {
  return {
    message: {
      token: deviceToken,
      notification: { title: payload.title, body: payload.body },
      data: payload.url ? { url: payload.url } : {},
      android: { priority: "HIGH", notification: { channel_id: "default", sound: "default" } },
    },
  };
}

// El token OAuth2 dura 1 h; se cachea 50 min para no firmar en cada envío.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(account: ServiceAccount): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) return cachedToken.value;
  const res = await fetch(account.token_uri ?? "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: buildGoogleJwt(account),
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) return null;
  cachedToken = { value: json.access_token, expiresAt: now + 50 * 60 * 1000 };
  return json.access_token;
}

/**
 * Envía la push a todos los Android del usuario. Borra los tokens que FCM
 * reporta como dados de baja (404 / UNREGISTERED).
 */
export async function sendFcmPushToUser(userId: string, payload: PushPayload): Promise<void> {
  try {
    const account = readServiceAccount();
    if (!account) return;

    const rows = await prisma.pushToken.findMany({
      where: { userId, token: { startsWith: FCM_TOKEN_PREFIX } },
      select: { token: true },
    });
    if (rows.length === 0) return;

    const accessToken = await getAccessToken(account);
    if (!accessToken) return;

    const endpoint = `https://fcm.googleapis.com/v1/projects/${account.project_id}/messages:send`;
    const stale: string[] = [];
    await Promise.all(
      rows.map(async ({ token }) => {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify(buildFcmMessage(token.slice(FCM_TOKEN_PREFIX.length), payload)),
          });
          if (res.status === 404) {
            stale.push(token);
            return;
          }
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            if (text.includes("UNREGISTERED") || text.includes("INVALID_ARGUMENT")) stale.push(token);
          }
        } catch {
          // un dispositivo que falla no debe frenar a los demás
        }
      }),
    );

    if (stale.length > 0) {
      await prisma.pushToken.deleteMany({ where: { token: { in: stale } } }).catch(() => {});
    }
  } catch {
    // silencioso — el push nunca debe romper el flujo de negocio
  }
}
