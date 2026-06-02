import { prisma } from "@/lib/prisma";
import { sendLearningReflectionInviteIfNeeded } from "@/lib/learning-reflection-invite";
import { normalizeSectionActivities } from "@/lib/section-activities";
import { createNotification } from "@/lib/notification-helpers";

/**
 * Recalcula progreso del enrollment y crea certificado si llega al 100%.
 * Sin autenticación: solo debe llamarse desde rutas/API que ya validaron al usuario
 * o desde código server que ya comprobó el enrollment.
 */
export async function recalculateEnrollmentProgress(
  enrollmentId: string,
  courseId: string
): Promise<number> {
  const [totalLessons, completedLessons, sections, gateSubmissions, course, examSubmission, enrollment] =
    await Promise.all([
      prisma.lesson.count({ where: { section: { courseId } } }),
      prisma.lessonProgress.count({
        where: {
          enrollmentId,
          lesson: { section: { courseId } },
        },
      }),
      prisma.courseSection.findMany({
        where: { courseId },
        select: { id: true, quiz: true, minigame: true, activities: true },
      }),
      prisma.sectionQuizSubmission.findMany({
        where: { enrollmentId, passed: true },
        select: { sectionId: true, activityId: true },
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

  if (!enrollment) {
    return 0;
  }

  const passedGateKeys = new Set(gateSubmissions.map((s) => `${s.sectionId}\t${s.activityId}`));

  let totalGateUnits = 0;
  let completedGateUnits = 0;
  for (const sec of sections) {
    const acts = normalizeSectionActivities(sec);
    for (const act of acts) {
      totalGateUnits++;
      if (passedGateKeys.has(`${sec.id}\t${act.id}`)) {
        completedGateUnits++;
      }
    }
  }

  const hasFinalExam = !!(
    course?.finalExam &&
    (course.finalExam as { questions?: unknown[] }).questions?.length
  );

  /** Contenido obligatorio del curso: todas las lecciones + actividades de cierre en la sección (legacy). */
  const contentTotalUnits = totalLessons + totalGateUnits;
  const contentCompletedUnits = completedLessons + completedGateUnits;

  /**
   * Certificado y "curso completado": solo contenido (lecciones + cierres de sección).
   * El examen final no bloquea el certificado ni la calificación mostrada como 100%;
   * la nota del examen solo afecta el tipo (acreditación vs participación) si lo presentó.
   */
  const contentFullyComplete =
    contentTotalUnits > 0 && contentCompletedUnits >= contentTotalUnits;

  /** Barra de progreso: opcionalmente incluye 1 unidad por examen enviado (informativo). */
  const totalUnitsWithExam = contentTotalUnits + (hasFinalExam ? 1 : 0);
  const completedUnitsWithExam =
    contentCompletedUnits + (examSubmission ? 1 : 0);

  const progress = contentFullyComplete
    ? 100
    : totalUnitsWithExam > 0
      ? Math.round((completedUnitsWithExam / totalUnitsWithExam) * 100)
      : 0;

  const fullyComplete = contentFullyComplete;

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { progress },
  });

  if (fullyComplete) {
    if (enrollment.status !== "completed") {
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { status: "completed" },
      });
    }

    const existingCert = await prisma.certificate.findUnique({
      where: { enrollmentId },
    });

    if (!existingCert) {
      const certNumber = `CUR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      // Acreditación solo si presentó examen y aprobó; si no hay examen o no lo presentó / no aprobó → participación.
      const certType =
        hasFinalExam && examSubmission?.passed ? "accreditation" : "participation";
      const certificate = await prisma.certificate.create({
        data: {
          enrollmentId,
          userId: enrollment.studentId,
          courseId,
          number: certNumber,
          type: certType,
        },
      });

      try {
        await createNotification({
          userId: enrollment.studentId,
          type: "certificate",
          title: certType === "accreditation"
            ? "Certificado de acreditación"
            : "Reconocimiento de participación",
          body: certType === "accreditation"
            ? `Has completado el curso "${course?.title || ""}". Tu certificado de acreditación ya está disponible.`
            : `Has completado el curso "${course?.title || ""}". Tu reconocimiento de participación ya está disponible.`,
          link: `/dashboard/certificates/${certificate.id}`,
        });
      } catch {
        /* el certificado ya existe; la notificación no debe bloquear */
      }
    }

    void sendLearningReflectionInviteIfNeeded(enrollmentId);
  }

  return progress;
}

/**
 * Reintenta recalcular inscripciones sin certificado (p. ej. tras cambiar la fórmula de completado).
 */
export async function repairCertificatesForStudent(studentId: string): Promise<void> {
  const pending = await prisma.enrollment.findMany({
    where: {
      studentId,
      certificate: null,
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: { id: true, courseId: true },
  });
  for (const e of pending) {
    await recalculateEnrollmentProgress(e.id, e.courseId);
  }
}
