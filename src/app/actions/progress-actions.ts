"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const totalLessons = await prisma.lesson.count({
    where: { section: { courseId } },
  });
  const completedLessons = await prisma.lessonProgress.count({
    where: { enrollmentId: enrollment.id },
  });

  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { progress },
  });

  return { progress, completedLessons, totalLessons };
}
