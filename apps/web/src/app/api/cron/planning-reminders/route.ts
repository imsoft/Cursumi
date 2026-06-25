import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPlanningReminderEmail } from "@/lib/email";
import { PLANNING_DOCUMENTS } from "@/lib/planning/registry";

// GET /api/cron/planning-reminders
// Semanal (lunes 09:00) — envía recordatorio a instructores con expedientes incompletos.
// Solo cursos presenciales con al menos un documento guardado pero sin completar el expediente.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const availableTypes = PLANNING_DOCUMENTS.filter((d) => d.available).map((d) => d.type);
  const total = availableTypes.length;

  // Cursos por evento que tengan al menos 1 documento de planeación guardado
  const coursesWithDocs = await prisma.coursePlanningDocument.findMany({
    where: { course: { modality: "evento" } },
    select: { courseId: true, status: true },
  });

  // Agrupar por curso: contar completados
  const courseMap = new Map<string, number>();
  for (const doc of coursesWithDocs) {
    if (doc.status === "completed") {
      courseMap.set(doc.courseId, (courseMap.get(doc.courseId) ?? 0) + 1);
    } else if (!courseMap.has(doc.courseId)) {
      courseMap.set(doc.courseId, 0);
    }
  }

  // Filtrar: solo cursos con expediente incompleto
  const incompleteCourseIds = [...courseMap.entries()]
    .filter(([, count]) => count < total)
    .map(([id]) => id);

  if (incompleteCourseIds.length === 0) {
    return NextResponse.json({ sent: 0, total: 0 });
  }

  // Cargar datos del curso + instructor
  const courses = await prisma.course.findMany({
    where: { id: { in: incompleteCourseIds } },
    select: {
      id: true,
      title: true,
      instructor: { select: { email: true, name: true } },
    },
  });

  // Cargar documentos completados por curso para saber cuáles faltan
  const completedDocs = await prisma.coursePlanningDocument.findMany({
    where: { courseId: { in: incompleteCourseIds }, status: "completed" },
    select: { courseId: true, type: true },
  });

  const completedByCoure = new Map<string, Set<string>>();
  for (const doc of completedDocs) {
    if (!completedByCoure.has(doc.courseId)) completedByCoure.set(doc.courseId, new Set());
    completedByCoure.get(doc.courseId)!.add(doc.type);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let sent = 0;

  for (const course of courses) {
    const completedSet = completedByCoure.get(course.id) ?? new Set<string>();
    const completed = completedSet.size;
    const pendingDocs = PLANNING_DOCUMENTS.filter(
      (d) => d.available && !completedSet.has(d.type),
    ).map((d) => d.title);

    try {
      await sendPlanningReminderEmail({
        to: course.instructor.email,
        name: course.instructor.name || "Instructor",
        courseTitle: course.title,
        completed,
        total,
        pendingDocs,
        planningUrl: `${baseUrl}/instructor/courses/${course.id}/planning`,
      });
      sent++;
    } catch {
      // No interrumpir el loop si un email falla
    }
  }

  return NextResponse.json({ sent, total: courses.length });
}
