import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendExamRetryEmail } from "@/lib/email";

// GET /api/cron/exam-retry-reminders
// Ejecutado por Vercel Cron Jobs — notifica a estudiantes cuando expira el cooldown de 4 horas
// para volver a tomar el examen de un curso en el que no aprobaron.
// Protegido con CRON_SECRET.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cooldown de 4 horas
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

  // Obtener envíos reprobados que tengan al menos 4 horas
  const failedSubmissions = await prisma.examSubmission.findMany({
    where: {
      passed: false,
      submittedAt: { lt: fourHoursAgo },
    },
    include: {
      enrollment: {
        include: {
          student: { select: { email: true, name: true } },
          course: { select: { title: true } },
        },
      },
    },
    take: 100, // Evitar timeouts procesando en lotes
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let notifiedCount = 0;

  for (const submission of failedSubmissions) {
    const { enrollment } = submission;
    const courseId = enrollment.courseId;
    const studentId = enrollment.studentId;
    const examUrl = `${baseUrl}/dashboard/my-courses/${courseId}/exam`;

    // Buscar si ya enviamos una notificación de reintento para este envío (después de submittedAt)
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId: studentId,
        type: "exam_retry",
        link: `/dashboard/my-courses/${courseId}/exam`,
        createdAt: { gte: submission.submittedAt },
      },
    });

    if (!existingNotification) {
      try {
        // 1. Crear notificación en plataforma
        await prisma.notification.create({
          data: {
            userId: studentId,
            type: "exam_retry",
            title: "Examen disponible para reintento",
            body: `Ya puedes volver a realizar el examen final del curso "${enrollment.course.title}".`,
            link: `/dashboard/my-courses/${courseId}/exam`,
          },
        });

        // 2. Enviar correo electrónico
        if (enrollment.student.email) {
          await sendExamRetryEmail({
            to: enrollment.student.email,
            name: enrollment.student.name || "Estudiante",
            courseTitle: enrollment.course.title,
            examUrl,
          });
        }

        notifiedCount++;
      } catch (err) {
        console.error(`Error al notificar al estudiante ${studentId} para el curso ${courseId}:`, err);
      }
    }
  }

  return NextResponse.json({ notified: notifiedCount, checked: failedSubmissions.length });
}
