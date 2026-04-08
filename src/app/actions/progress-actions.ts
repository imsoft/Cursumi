"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalculateEnrollmentProgress } from "@/lib/enrollment-progress";

async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("No autenticado");
  }
  return session;
}

/**
 * Recalcula el progreso del enrollment contando lecciones, gates de sección y examen final.
 * Solo para el estudiante dueño del enrollment (p. ej. desde el cliente).
 * Las rutas API deben usar `recalculateEnrollmentProgress` en lib tras validar sesión.
 */
export async function recalculateProgress(enrollmentId: string, courseId: string) {
  const session = await requireSession();
  const enrollment = await prisma.enrollment.findFirst({
    where: { id: enrollmentId, courseId, studentId: session.user.id },
    select: { id: true },
  });
  if (!enrollment) {
    throw new Error("No autorizado");
  }
  return recalculateEnrollmentProgress(enrollmentId, courseId);
}

/**
 * Marca una lección como completada para el estudiante actual y recalcula el progreso.
 */
export async function completeLesson(courseId: string, lessonId: string) {
  const session = await requireSession();

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      courseId_studentId: {
        courseId,
        studentId: session.user.id,
      },
    },
    select: { id: true },
  });

  if (!enrollment) {
    throw new Error("No estás inscrito en este curso");
  }

  await prisma.lessonProgress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId,
      },
    },
    update: {},
    create: {
      enrollmentId: enrollment.id,
      lessonId,
    },
  });

  const progress = await recalculateEnrollmentProgress(enrollment.id, courseId);

  const totalLessons = await prisma.lesson.count({ where: { section: { courseId } } });
  const completedLessons = await prisma.lessonProgress.count({
    where: {
      enrollmentId: enrollment.id,
      lesson: { section: { courseId } },
    },
  });

  return { progress, completedLessons, totalLessons };
}
