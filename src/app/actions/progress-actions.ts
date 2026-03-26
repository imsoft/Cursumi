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
 * Si el progreso llega al 100%, marca el enrollment como completado y genera el certificado.
 */
export async function recalculateProgress(enrollmentId: string, courseId: string) {
  const [totalLessons, completedLessons, sections, passedGates, course, examSubmission, enrollment] =
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
        select: { finalExam: true, title: true },
      }),
      prisma.examSubmission.findUnique({
        where: { enrollmentId },
        select: { passed: true },
      }),
      prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        select: { studentId: true, status: true },
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

  // Si el progreso llega al 100%, marcar como completado y generar certificado
  if (progress === 100 && enrollment && enrollment.status !== "completed") {
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: "completed" },
    });

    // Generar certificado si no existe
    const existingCert = await prisma.certificate.findUnique({
      where: { enrollmentId },
    });

    if (!existingCert) {
      const certNumber = `CUR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      // Si aprobó examen final → acreditación, si no tiene examen → participación
      const certType = examSubmission?.passed ? "accreditation" : "participation";
      const certificate = await prisma.certificate.create({
        data: {
          enrollmentId,
          userId: enrollment.studentId,
          courseId,
          number: certNumber,
          type: certType,
        },
      });

      // Notificar al estudiante
      await prisma.notification.create({
        data: {
          userId: enrollment.studentId,
          type: "certificate",
          title: certType === "accreditation"
            ? "Certificado de acreditación"
            : "Reconocimiento de participación",
          body: certType === "accreditation"
            ? `Has completado el curso "${course?.title || ""}". Tu certificado de acreditación ya está disponible.`
            : `Has completado el curso "${course?.title || ""}". Tu reconocimiento de participación ya está disponible.`,
          link: `/dashboard/certificates/${certificate.id}`,
        },
      });
    }
  }

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
