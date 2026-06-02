/**
 * Servidor Web Push — lazy initialization similar al patrón del Stripe proxy.
 *
 * Requiere en .env:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
 *   VAPID_PRIVATE_KEY=...
 *   VAPID_CONTACT_EMAIL=contacto@cursumi.com
 *
 * Para generar claves VAPID:
 *   node -e "const wp=require('web-push'); const k=wp.generateVAPIDKeys(); console.log(JSON.stringify(k))"
 */
import type { PushSubscription as WebPushSubscription } from "web-push";
import { prisma } from "./prisma";

let _webPush: typeof import("web-push") | null = null;
let _initialized = false;

function getWebPush() {
  if (!_initialized) {
    const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const priv = process.env.VAPID_PRIVATE_KEY;
    const email = process.env.VAPID_CONTACT_EMAIL || "contacto@cursumi.com";

    if (pub && priv) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const wp = require("web-push") as typeof import("web-push");
      wp.setVapidDetails(`mailto:${email}`, pub, priv);
      _webPush = wp;
    }
    _initialized = true;
  }
  return _webPush;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Envía una push notification a todas las suscripciones del usuario.
 * Silencioso en caso de error — nunca lanza.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  const wp = getWebPush();
  if (!wp) return; // VAPID no configurado

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
    select: { endpoint: true, keys: true },
  });

  const data = JSON.stringify(payload);

  await Promise.allSettled(
    subscriptions.map((sub) =>
      wp.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys as WebPushSubscription["keys"],
        },
        data
      ).catch(async (err: { statusCode?: number }) => {
        // 410 Gone = suscripción expirada → eliminar
        if (err?.statusCode === 410) {
          await prisma.pushSubscription.deleteMany({
            where: { endpoint: sub.endpoint },
          }).catch(() => {});
        }
      })
    )
  );
}

export function isWebPushConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}
