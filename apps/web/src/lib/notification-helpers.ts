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
 * Todo lo que debe ocurrir cuando alguien queda inscrito en un curso:
 * avisar al alumno y al instructor, mandar el correo de bienvenida y registrar
 * la comisión de referido.
 *
 * Vive aquí —y no dentro del webhook de Stripe— porque hay DOS caminos de
 * inscripción: el de pago (webhook) y el directo, que se usa cuando el importe
 * es 0 (curso gratuito o cupón del 100%) porque Stripe no dispara el webhook.
 * Al tenerlo centralizado, los dos hacen lo mismo y no vuelven a divergir.
 *
 * Nada de esto debe tumbar la inscripción, que ya está confirmada: el correo y
 * la comisión se ejecutan en segundo plano y sus fallos solo se registran.
 */
export async function notifyEnrollment(params: {
  studentId: string;
  courseId: string;
  /** true = inscripción sin pago; cambia el texto que ve el alumno. */
  free?: boolean;
  /** Transacción asociada, para acreditar la comisión de referido. */
  transactionId?: string;
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

  // Acredita la comisión al que refirió. En cursos gratuitos el importe es 0,
  // pero igual hay que cerrar el referido para que no quede "pendiente".
  if (params.transactionId) {
    const { processReferralCommission } = await import("./referral");
    processReferralCommission(params.transactionId).catch((e) =>
      console.error("[enrollment] comisión de referido:", e),
    );
  }

  // Correo de bienvenida al curso.
  if (course) {
    void (async () => {
      try {
        const [{ sendEnrollmentEmail }, student] = await Promise.all([
          import("./email"),
          prisma.user.findUnique({
            where: { id: params.studentId },
            select: { email: true, name: true },
          }),
        ]);
        if (!student) return;
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        await sendEnrollmentEmail({
          to: student.email,
          name: student.name || "Estudiante",
          courseTitle: course.title,
          courseUrl: `${baseUrl}/dashboard/my-courses/${params.courseId}`,
        });
      } catch (e) {
        console.error("[enrollment] correo de bienvenida:", e);
      }
    })();
  }
}
