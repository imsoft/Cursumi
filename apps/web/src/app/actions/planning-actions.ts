"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserRole } from "@/lib/user-service";
import { getPlanningTotal, type CourseModality } from "@/lib/planning/registry";
import { stripHtml, extractPrefillQuestions, type PlanningPrefill } from "@/lib/planning/prefill";
import { displayDuration } from "@/lib/duration";
import { formatDateShortMX } from "@/lib/date-format";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("No autenticado");
  return session;
}

async function verifyCourseOwner(courseId: string, userId: string) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, instructorId: userId },
    select: { id: true },
  });
  if (!course) throw new Error("No autorizado");
}

export async function getPlanningPrefill(courseId: string): Promise<PlanningPrefill> {
  const session = await requireSession();
  await verifyCourseOwner(courseId, session.user.id);
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      title: true,
      duration: true,
      description: true,
      location: true,
      city: true,
      state: true,
      maxStudents: true,
      level: true,
      category: true,
      modality: true,
      startDate: true,
      finalExam: true,
      instructor: { select: { name: true } },
      sections: {
        orderBy: { order: "asc" },
        select: {
          title: true,
          quiz: true,
          lessons: { orderBy: { order: "asc" }, select: { title: true, duration: true } },
        },
      },
      courseSessions: {
        orderBy: { date: "asc" },
        select: { date: true, startTime: true, endTime: true, location: true, city: true, state: true, maxStudents: true },
      },
    },
  });

  const sessions = course?.courseSessions ?? [];
  const firstSession = sessions[0];

  const location =
    course?.location?.trim() ||
    firstSession?.location?.trim() ||
    [course?.city, course?.state].filter(Boolean).join(", ");

  const dates = sessions.length
    ? sessions.map((s) => formatDateShortMX(s.date)).join(", ")
    : course?.startDate
      ? formatDateShortMX(course.startDate)
      : "";

  const schedule =
    firstSession?.startTime && firstSession?.endTime
      ? `${firstSession.startTime}–${firstSession.endTime}`
      : "";

  const startDate = (course?.startDate ?? firstSession?.date)?.toISOString().slice(0, 10) ?? "";

  const participantCount =
    course?.maxStudents != null
      ? String(course.maxStudents)
      : firstSession?.maxStudents != null
        ? String(firstSession.maxStudents)
        : "";

  return {
    courseName: course?.title ?? "",
    instructorName: course?.instructor?.name ?? "",
    duration: course?.duration ? displayDuration(course.duration) : "",
    description: stripHtml(course?.description),
    location,
    dates,
    schedule,
    startDate,
    participantCount,
    level: course?.level ?? "",
    category: course?.category ?? "",
    modality: (course?.modality as string) ?? "",
    units: (course?.sections ?? []).map((s) => ({
      title: s.title,
      lessons: (s.lessons ?? []).map((l) => ({ title: l.title, durationLabel: l.duration ?? "" })),
    })),
    questions: extractPrefillQuestions(
      course?.finalExam ?? null,
      (course?.sections ?? []).map((s) => s.quiz),
    ),
  };
}

/** Estado de cada documento de planeación del curso (instructor titular). */
export async function listPlanningStatuses(courseId: string): Promise<Record<string, string>> {
  const session = await requireSession();
  await verifyCourseOwner(courseId, session.user.id);
  const docs = await prisma.coursePlanningDocument.findMany({
    where: { courseId },
    select: { type: true, status: true },
  });
  return Object.fromEntries(docs.map((d) => [d.type, d.status]));
}

export type PlanningProgress = { completed: number; total: number };

/** Progreso del expediente de planeación para múltiples cursos (una query). */
export async function getCoursesPlanningProgress(
  courses: { id: string; modality: CourseModality }[],
): Promise<Record<string, PlanningProgress>> {
  if (courses.length === 0) return {};
  const ids = courses.map((c) => c.id);

  const docs = await prisma.coursePlanningDocument.findMany({
    where: { courseId: { in: ids }, status: "completed" },
    select: { courseId: true },
  });

  const counts: Record<string, number> = {};
  for (const id of ids) counts[id] = 0;
  for (const doc of docs) counts[doc.courseId] = (counts[doc.courseId] ?? 0) + 1;

  return Object.fromEntries(
    courses.map((c) => [c.id, { completed: counts[c.id] ?? 0, total: getPlanningTotal(c.modality) }]),
  );
}

/** Carga el documento de planeación (instructor titular). Devuelve null si no existe. */
export async function getPlanningDocument(courseId: string, type: string) {
  const session = await requireSession();
  await verifyCourseOwner(courseId, session.user.id);
  const doc = await prisma.coursePlanningDocument.findUnique({
    where: { courseId_type: { courseId, type } },
    select: { data: true, status: true, updatedAt: true },
  });
  return doc;
}

/** Crea o actualiza el documento (instructor titular). */
export async function savePlanningDocument(
  courseId: string,
  type: string,
  data: unknown,
  status: "draft" | "completed" = "draft",
) {
  const session = await requireSession();
  await verifyCourseOwner(courseId, session.user.id);

  await prisma.coursePlanningDocument.upsert({
    where: { courseId_type: { courseId, type } },
    update: { data: data as object, status },
    create: { courseId, type, data: data as object, status },
  });

  revalidatePath(`/instructor/courses/${courseId}/planning`);
  revalidatePath(`/instructor/courses/${courseId}`);
  return { success: true };
}

// ─── Admin ────────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await requireSession();
  const role = await getUserRole(session.user.id);
  if (role !== "admin") throw new Error("No autorizado");
  return session;
}

/** Lista todos los documentos de planeación de un curso, con el título del curso (admin). */
export async function getCoursePlanningForAdmin(courseId: string) {
  await requireAdmin();
  const [course, docs] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true, instructor: { select: { name: true } } },
    }),
    prisma.coursePlanningDocument.findMany({
      where: { courseId },
      select: { type: true, data: true, status: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  return {
    courseTitle: course?.title ?? "Curso",
    instructorName: course?.instructor?.name ?? "",
    docs,
  };
}
