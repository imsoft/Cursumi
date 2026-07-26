/**
 * Helper centralizado para crear notificaciones en BD y enviar Web Push.
 *
 * Reemplaza los prisma.notification.create() directos esparcidos en la app.
 * El envío de push es fire-and-forget: nunca bloquea ni lanza error.
 */
import { prisma } from "./prisma";
import { sendPushToUser } from "./web-push";
import { sendExpoPushToUser } from "./expo-push";

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
  const payload = {
    title: input.title,
    body: input.body,
    url: input.link,
  };
  sendPushToUser(input.userId, payload).catch(() => {}); // web (navegador)
  sendExpoPushToUser(input.userId, payload).catch(() => {}); // móvil (Expo)

  return notification;
}

/**
 * Avisa al alumno y al instructor de una inscripción.
 *
 * Vive aquí —y no dentro del webhook de Stripe— porque hay DOS caminos de
 * inscripción: el de pago (webhook) y el directo, que se usa cuando el importe
 * es 0 (curso gratuito o cupón del 100%) porque Stripe no dispara el webhook.
 * Al tenerlo centralizado, los dos avisan igual y no vuelven a divergir.
 */
export async function notifyEnrollment(params: {
  studentId: string;
  courseId: string;
  /** true = inscripción sin pago; cambia el texto que ve el alumno. */
  free?: boolean;
}) {
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    select: { instructorId: true, title: true },
  });

  await createNotification({
    userId: params.studentId,
    type: "enrollment",
    title: "Inscripción confirmada",
    body: params.free
      ? "Ya tienes acceso al curso. ¡Puedes empezar cuando quieras!"
      : "Tu pago fue procesado exitosamente. ¡Ya puedes acceder al curso!",
    link: `/dashboard/my-courses/${params.courseId}`,
  });

  // El instructor no debe recibir aviso si se inscribe a su propio curso.
  if (course && course.instructorId !== params.studentId) {
    await createNotification({
      userId: course.instructorId,
      type: "enrollment",
      title: "Nueva inscripción",
      body: `Un nuevo estudiante se inscribió en "${course.title}".`,
      link: `/instructor/courses/${params.courseId}`,
    });
  }
}
