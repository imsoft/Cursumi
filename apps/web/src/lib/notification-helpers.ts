/**
 * Helper centralizado para crear notificaciones en BD y enviar Web Push.
 *
 * Reemplaza los prisma.notification.create() directos esparcidos en la app.
 * El envío de push es fire-and-forget: nunca bloquea ni lanza error.
 */
import { prisma } from "./prisma";
import { sendPushToUser } from "./web-push";

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
    },
  });

  // Enviar push en background — nunca await
  sendPushToUser(input.userId, {
    title: input.title,
    body: input.body,
    url: input.link,
  }).catch(() => {}); // silencioso

  return notification;
}
