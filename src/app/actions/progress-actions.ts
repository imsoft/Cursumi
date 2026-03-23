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
 * Recalcula el progreso del enrollment contando lecciones, gates de sección y examen final.
 * Puede llamarse desde cualquier endpoint que afecte el progreso.
 */
export async function recalculateProgress(enrollmentId: string, courseId: string) {
  const [totalLessons, completedLessons, sections, passedGates, course, examSubmission] =
    await Promise.all([
      prisma.lesson.count({ where: { section: { courseId } } }),
      prisma.lessonProgress.count({ where: { enrollmentId } }),
      prisma.courseSection.findMany({
        where: { courseId },
        select: { id: true, quiz: true, minigame: true },
      }),
      prisma.sectionQuizSubmission.count({
        where: { enrollmentId, passed: true },
      }),
      prisma.course.findUnique({
        where: { id: courseId },
        select: { finalExam: true },
      }),
      prisma.examSubmission.findUnique({
        where: { enrollmentId },
        select: { passed: true },
      }),
    ]);

  const gatedSections = sections.filter(
    (s) =>
      (s.quiz && (s.quiz as { questions?: unknown[] }).questions?.length) ||
      (s.minigame && (s.minigame as { type?: string }).type),
  ).length;

  const hasFinalExam = !!(
    course?.finalExam &&
    (course.finalExam as { questions?: unknown[] }).questions?.length
  );

  const totalUnits = totalLessons + gatedSections + (hasFinalExam ? 1 : 0);
  const completedUnits =
    completedLessons + passedGates + (examSubmission?.passed ? 1 : 0);

  const progress = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { progress },
  });

  return progress;
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

  const progress = await recalculateProgress(enrollment.id, courseId);

  const totalLessons = await prisma.lesson.count({ where: { section: { courseId } } });
  const completedLessons = await prisma.lessonProgress.count({ where: { enrollmentId: enrollment.id } });

  return { progress, completedLessons, totalLessons };
}
