"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserRole } from "@/lib/user-service";

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

export type PlanningPrefill = {
  courseName: string;
  instructorName: string;
  duration: string;
};

export async function getPlanningPrefill(courseId: string): Promise<PlanningPrefill> {
  const session = await requireSession();
  await verifyCourseOwner(courseId, session.user.id);
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { title: true, duration: true, instructor: { select: { name: true } } },
  });
  return {
    courseName: course?.title ?? "",
    instructorName: course?.instructor?.name ?? "",
    duration: course?.duration ?? "",
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
  revalidatePath("/instructor/planning");
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
