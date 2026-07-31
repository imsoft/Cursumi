import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLearningReflectionInviteIfNeeded } from "@/lib/learning-reflection-invite";
import { checkCronAuth } from "@/lib/cron-auth";

// GET /api/cron/learning-reflection-emails
// Sesiones presenciales ya pasadas: invita a alumnos que aún no recibieron el correo.
// Protegido con CRON_SECRET (igual que otros crons).
export async function GET(req: NextRequest) {
  const noAutorizado = checkCronAuth(req);
  if (noAutorizado) return noAutorizado;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const enrollments = await prisma.enrollment.findMany({
    where: {
      learningReflectionEmailSentAt: null,
      course: {
        modality: "evento",
        status: "published",
      },
      session: {
        date: { lt: startOfToday },
      },
      status: { in: ["active", "completed"] },
    },
    select: { id: true },
    take: 80,
  });

  let sent = 0;
  for (const e of enrollments) {
    const ok = await sendLearningReflectionInviteIfNeeded(e.id);
    if (ok) sent++;
  }

  return NextResponse.json({ sent, total: enrollments.length });
}
