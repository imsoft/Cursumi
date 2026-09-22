/**
 * Envío de notificaciones push a la app nativa de iOS vía APNs (HTTP/2 + JWT).
 *
 * Los tokens de dispositivo se guardan en la misma tabla que los de Expo
 * (`ExpoPushToken`) con el prefijo `apns:` seguido del token hexadecimal, así
 * no hace falta migración y cada canal filtra los suyos.
 *
 * Variables de entorno (Apple Developer → Keys → Apple Push Notifications):
 *   APNS_KEY_ID   — id de la clave .p8 (10 caracteres)
 *   APNS_TEAM_ID  — Team ID de Apple
 *   APNS_KEY      — contenido del .p8 (PEM; los saltos de línea pueden ir como \n)
 *   APNS_SANDBOX  — "true" para builds de desarrollo (api.sandbox.push.apple.com)
 *
 * Sin esas variables no se envía nada. Mismo contrato silencioso que web-push:
 * nunca lanza, fire-and-forget.
 */
import { createSign } from "node:crypto";
import http2 from "node:http2";
import { prisma } from "./prisma";
import type { PushPayload } from "./web-push";

export const APNS_TOKEN_PREFIX = "apns:";
/** Bundle id de la app de iOS (apps/ios/project.yml). */
const APNS_TOPIC = "com.cursumi.app";

export function isApnsToken(token: string): boolean {
  return /^apns:[0-9a-f]{64}$/i.test(token);
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

/**
 * JWT ES256 para autenticar con APNs. Apple lo acepta hasta 60 min; se cachea
 * 50 min para no firmar en cada envío.
 */
let cachedJwt: { value: string; issuedAt: number } | null = null;

export function buildApnsJwt(
  { keyId, teamId, privateKey }: { keyId: string; teamId: string; privateKey: string },
  now = Math.floor(Date.now() / 1000),
): string {
  const header = base64url(JSON.stringify({ alg: "ES256", kid: keyId }));
  const claims = base64url(JSON.stringify({ iss: teamId, iat: now }));
  const signer = createSign("SHA256");
  signer.update(`${header}.${claims}`);
  const signature = signer.sign({ key: privateKey.replace(/\\n/g, "\n"), dsaEncoding: "ieee-p1363" });
  return `${header}.${claims}.${base64url(signature)}`;
}

function getJwt(): string | null {
  const keyId = process.env.APNS_KEY_ID?.trim();
  const teamId = process.env.APNS_TEAM_ID?.trim();
  const privateKey = process.env.APNS_KEY?.trim();
  if (!keyId || !teamId || !privateKey) return null;
  const now = Math.floor(Date.now() / 1000);
  if (cachedJwt && now - cachedJwt.issuedAt < 50 * 60) return cachedJwt.value;
  cachedJwt = { value: buildApnsJwt({ keyId, teamId, privateKey }, now), issuedAt: now };
  return cachedJwt.value;
}

/** Cuerpo del aviso tal como lo espera APNs. */
export function buildApnsBody(payload: PushPayload): string {
  return JSON.stringify({
    aps: { alert: { title: payload.title, body: payload.body }, sound: "default", badge: 1 },
    ...(payload.url ? { url: payload.url } : {}),
  });
}

type SendResult = { status: number; reason?: string };

function sendOne(client: http2.ClientHttp2Session, jwt: string, deviceToken: string, body: string): Promise<SendResult> {
  return new Promise((resolve) => {
    const req = client.request({
      ":method": "POST",
      ":path": `/3/device/${deviceToken}`,
      authorization: `bearer ${jwt}`,
      "apns-topic": APNS_TOPIC,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
    });
    let status = 0;
    let data = "";
    req.on("response", (headers) => {
      status = Number(headers[":status"] ?? 0);
    });
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      let reason: string | undefined;
      try {
        reason = (JSON.parse(data) as { reason?: string }).reason;
      } catch {}
      resolve({ status, reason });
    });
    req.on("error", () => resolve({ status: 0 }));
    req.setTimeout(10_000, () => {
      req.close();
      resolve({ status: 0 });
    });
    req.end(body);
  });
}

/**
 * Envía la push a todos los iPhone del usuario. Borra los tokens que Apple
 * reporta como inválidos o dados de baja (410 / BadDeviceToken).
 */
export async function sendApnsPushToUser(userId: string, payload: PushPayload): Promise<void> {
  try {
    const jwt = getJwt();
    if (!jwt) return;

    const rows = await prisma.expoPushToken.findMany({
      where: { userId, token: { startsWith: APNS_TOKEN_PREFIX } },
      select: { token: true },
    });
    if (rows.length === 0) return;

    const host =
      process.env.APNS_SANDBOX === "true" ? "https://api.sandbox.push.apple.com" : "https://api.push.apple.com";
    const client = http2.connect(host);
    const body = buildApnsBody(payload);
    const stale: string[] = [];
    try {
      await Promise.all(
        rows.map(async ({ token }) => {
          const result = await sendOne(client, jwt, token.slice(APNS_TOKEN_PREFIX.length), body);
          if (result.status === 410 || result.reason === "BadDeviceToken" || result.reason === "Unregistered") {
            stale.push(token);
          }
        }),
      );
    } finally {
      client.close();
    }

    if (stale.length > 0) {
      await prisma.expoPushToken.deleteMany({ where: { token: { in: stale } } }).catch(() => {});
    }
  } catch {
    // silencioso — el push nunca debe romper el flujo de negocio
  }
}
