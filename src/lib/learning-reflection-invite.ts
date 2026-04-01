import { prisma } from "@/lib/prisma";
import { sendLearningReflectionEmail } from "@/lib/email";

/**
 * Envía el correo "¿Qué aprendiste?" una sola vez por inscripción.
 * Actualiza `learningReflectionEmailSentAt` solo si el envío fue correcto.
 */
export async function sendLearningReflectionInviteIfNeeded(enrollmentId: string): Promise<boolean> {
  const en = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      learningReflectionEmailSentAt: true,
      student: { select: { email: true, name: true } },
      course: { select: { title: true, slug: true, id: true } },
    },
  });

  if (!en || en.learningReflectionEmailSentAt) return false;

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const respondUrl = `${baseUrl}/dashboard/my-courses/${en.course.id}/que-aprendiste`;
  const coursePublicUrl = en.course.slug
    ? `${baseUrl}/courses/${en.course.slug}`
    : `${baseUrl}/dashboard/explore`;

  try {
    await sendLearningReflectionEmail({
      to: en.student.email,
      name: en.student.name || "Estudiante",
      courseTitle: en.course.title,
      respondUrl,
      coursePublicUrl,
    });
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { learningReflectionEmailSentAt: new Date() },
    });
    return true;
  } catch (e) {
    console.error("sendLearningReflectionInviteIfNeeded:", e);
    return false;
  }
}
