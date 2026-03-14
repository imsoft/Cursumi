import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendProgressReminderEmail } from "@/lib/email";

// GET /api/cron/progress-reminders
// Llamado por Vercel Cron Jobs (vercel.json) — envía recordatorios a estudiantes
// con cursos en progreso que no han tenido actividad en 7 días.
// Protegido con CRON_SECRET para que solo Vercel pueda llamarlo.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Estudiantes con cursos activos sin actividad en 7+ días (progreso 1-99)
  const staleEnrollments = await prisma.enrollment.findMany({
    where: {
      status: "active",
      progress: { gt: 0, lt: 100 },
      updatedAt: { lt: sevenDaysAgo },
    },
    select: {
      id: true,
      progress: true,
      courseId: true,
      student: { select: { email: true, name: true } },
      course: { select: { title: true } },
    },
    take: 100, // procesar máx 100 por ejecución para evitar timeouts
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let sent = 0;

  for (const enrollment of staleEnrollments) {
    try {
      await sendProgressReminderEmail({
        to: enrollment.student.email,
        name: enrollment.student.name || "Estudiante",
        courseTitle: enrollment.course.title,
        progress: enrollment.progress,
        courseUrl: `${baseUrl}/dashboard/my-courses/${enrollment.courseId}`,
      });
      sent++;
    } catch {
      // No interrumpir el loop si un email falla
    }
  }

  return NextResponse.json({ sent, total: staleEnrollments.length });
}
