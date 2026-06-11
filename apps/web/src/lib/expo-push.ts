/**
 * Envío de notificaciones push a la app móvil (Expo) vía Expo Push API.
 *
 * No requiere SDK ni credenciales: Expo expone un endpoint HTTP público que
 * enruta a APNs/FCM usando el ExponentPushToken del dispositivo.
 * https://docs.expo.dev/push-notifications/sending-notifications/
 *
 * Mismo contrato silencioso que web-push: nunca lanza, fire-and-forget.
 */
import { prisma } from "./prisma";
import type { PushPayload } from "./web-push";

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  sound: "default";
  data?: Record<string, unknown>;
}

interface ExpoPushTicket {
  status: "ok" | "error";
  details?: { error?: string };
}

/**
 * Envía una push a todos los dispositivos Expo del usuario.
 * Elimina tokens marcados por Expo como no registrados (DeviceNotRegistered).
 */
export async function sendExpoPushToUser(userId: string, payload: PushPayload): Promise<void> {
  const tokens = await prisma.expoPushToken.findMany({
    where: { userId },
    select: { token: true },
  });
  if (tokens.length === 0) return;

  const messages: ExpoPushMessage[] = tokens.map(({ token }) => ({
    to: token,
    title: payload.title,
    body: payload.body,
    sound: "default",
    data: payload.url ? { url: payload.url } : undefined,
  }));

  try {
    const res = await fetch(EXPO_PUSH_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
    if (!res.ok) return;

    const json = (await res.json()) as { data?: ExpoPushTicket[] };
    const tickets = json.data ?? [];

    // Limpia tokens que Expo reporta como dados de baja.
    const stale: string[] = [];
    tickets.forEach((ticket, i) => {
      if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
        const dead = messages[i]?.to;
        if (dead) stale.push(dead);
      }
    });
    if (stale.length > 0) {
      await prisma.expoPushToken
        .deleteMany({ where: { token: { in: stale } } })
        .catch(() => {});
    }
  } catch {
    // silencioso — el push nunca debe romper el flujo de negocio
  }
}
