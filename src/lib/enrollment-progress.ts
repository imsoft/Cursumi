import { prisma } from "@/lib/prisma";
import { sendLearningReflectionInviteIfNeeded } from "@/lib/learning-reflection-invite";
import { normalizeSectionActivities } from "@/lib/section-activities";

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

  const totalUnits = totalLessons + totalGateUnits + (hasFinalExam ? 1 : 0);
  const completedUnits =
    completedLessons + completedGateUnits + (examSubmission ? 1 : 0);

  const progress = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { progress },
  });

  if (progress === 100) {
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

    void sendLearningReflectionInviteIfNeeded(enrollmentId);
  }

  return progress;
}
