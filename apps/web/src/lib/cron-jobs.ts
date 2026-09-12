import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  sendExamRetryEmail,
  sendPlanningReminderEmail,
  sendProfileReminderEmail,
  sendProgressReminderEmail,
} from "@/lib/email";
import { sendLearningReflectionInviteIfNeeded } from "@/lib/learning-reflection-invite";
import { PLANNING_DOCUMENTS } from "@/lib/planning/registry";

/**
 * Los trabajos programados, como funciones.
 *
 * Vivían dentro de sus rutas, una por cron. El plan gratuito de Vercel solo
 * permite un par de crons y únicamente con frecuencia diaria, así que seis
 * entradas en vercel.json significaban que la mayoría no se ejecutaba nunca.
 * Sacarlos aquí permite que un único cron diario los invoque a todos y decida
 * por día de la semana cuáles tocan. Cada ruta sigue existiendo para poder
 * dispararlos a mano.
 *
 * Ninguno lanza si falla un correo suelto: se cuenta lo enviado y se sigue.
 */

/** Qué día de la semana toca cada recordatorio semanal (0 domingo … 6 sábado). */
export const DIA_DE_TRABAJOS_SEMANALES = {
  progreso: 1, // lunes
  planeacion: 1, // lunes
  perfil: 3, // miércoles
} as const;

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com";
}

/**
 * Refresca la caché del blog para los artículos recién programados.
 *
 * No es lo que los hace visibles: de eso se encarga el filtro `publishedAt <= now`
 * de las lecturas. Esto solo evita que tarden hasta cinco minutos en aparecer,
 * que es la revalidación de las páginas del blog.
 */
export async function publicarBlogProgramado() {
  const now = new Date();
  // Ventana amplia para tolerar retrasos del cron y que no se escape ninguno.
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const due = await prisma.blogPost.findMany({
    where: { published: true, publishedAt: { lte: now, gt: since } },
    select: { slug: true },
  });

  if (due.length > 0) {
    revalidatePath("/blog");
    for (const { slug } of due) {
      revalidatePath(`/blog/${slug}`);
    }
  }

  return { revalidated: due.length, at: now.toISOString() };
}

/** Alumnos con un curso a medias y sin actividad en siete días. */
export async function recordatoriosDeProgreso() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const staleEnrollments = await prisma.enrollment.findMany({
    where: {
      status: "active",
      progress: { gt: 0, lt: 100 },
      updatedAt: { lt: sevenDaysAgo },
    },
    select: {
      id: true,
      progress: true,
      courseId: true,
      student: { select: { email: true, name: true } },
      course: { select: { title: true } },
    },
    take: 100, // procesar máx 100 por ejecución para evitar timeouts
  });

  const url = baseUrl();
  let sent = 0;

  for (const enrollment of staleEnrollments) {
    try {
      await sendProgressReminderEmail({
        to: enrollment.student.email,
        name: enrollment.student.name || "Estudiante",
        courseTitle: enrollment.course.title,
        progress: enrollment.progress,
        courseUrl: `${url}/dashboard/my-courses/${enrollment.courseId}`,
      });
      sent++;
    } catch {
      // No interrumpir el loop si un email falla
    }
  }

  return { sent, total: staleEnrollments.length };
}

/** Los campos que evaluamos para considerar completo un perfil. */
const PROFILE_FIELDS: { key: string; label: string }[] = [
  { key: "name", label: "Nombre completo" },
  { key: "image", label: "Foto de perfil" },
  { key: "phone", label: "Teléfono" },
  { key: "city", label: "Ciudad" },
  { key: "bio", label: "Biografía" },
  { key: "website", label: "Sitio web" },
  { key: "linkedinUrl", label: "LinkedIn" },
  { key: "instagramUrl", label: "Instagram" },
];

/** Usuarios con el perfil a medias, un día después de registrarse. */
export async function recordatoriosDePerfil() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: {
      createdAt: { lt: oneDayAgo },
      // Al menos un campo vacío = perfil incompleto
      OR: [
        { name: null },
        { name: "" },
        { image: null },
        { phone: null },
        { city: null },
        { bio: null },
        { website: null },
        { linkedinUrl: null },
        { instagramUrl: null },
      ],
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      phone: true,
      city: true,
      bio: true,
      website: true,
      linkedinUrl: true,
      instagramUrl: true,
    },
    take: 100,
  });

  const url = baseUrl();
  let sent = 0;
  let skipped = 0;

  for (const user of users) {
    const values: Record<string, string | null> = {
      name: user.name,
      image: user.image,
      phone: user.phone,
      city: user.city,
      bio: user.bio,
      website: user.website,
      linkedinUrl: user.linkedinUrl,
      instagramUrl: user.instagramUrl,
    };

    const missing = PROFILE_FIELDS.filter((f) => !values[f.key]);
    const filled = PROFILE_FIELDS.length - missing.length;
    const percent = Math.round((filled / PROFILE_FIELDS.length) * 100);

    if (missing.length === 0) {
      skipped++;
      continue;
    }

    try {
      await sendProfileReminderEmail({
        to: user.email,
        name: user.name || "Estudiante",
        percent,
        missingFields: missing.map((f) => f.label),
        profileUrl: `${url}/dashboard/account?tab=profile`,
      });
      sent++;
    } catch {
      // No interrumpir el loop
    }
  }

  return { sent, skipped, total: users.length };
}

/** Instructores con el expediente de planeación incompleto. */
export async function recordatoriosDePlaneacion() {
  const availableTypes = PLANNING_DOCUMENTS.filter((d) => d.available).map((d) => d.type);
  const total = availableTypes.length;

  const coursesWithDocs = await prisma.coursePlanningDocument.findMany({
    where: { course: { modality: "evento" } },
    select: { courseId: true, status: true },
  });

  const courseMap = new Map<string, number>();
  for (const doc of coursesWithDocs) {
    if (doc.status === "completed") {
      courseMap.set(doc.courseId, (courseMap.get(doc.courseId) ?? 0) + 1);
    } else if (!courseMap.has(doc.courseId)) {
      courseMap.set(doc.courseId, 0);
    }
  }

  const incompleteCourseIds = [...courseMap.entries()]
    .filter(([, count]) => count < total)
    .map(([id]) => id);

  if (incompleteCourseIds.length === 0) {
    return { sent: 0, total: 0 };
  }

  const courses = await prisma.course.findMany({
    where: { id: { in: incompleteCourseIds } },
    select: {
      id: true,
      title: true,
      instructor: { select: { email: true, name: true } },
    },
  });

  const completedDocs = await prisma.coursePlanningDocument.findMany({
    where: { courseId: { in: incompleteCourseIds }, status: "completed" },
    select: { courseId: true, type: true },
  });

  const completedByCourse = new Map<string, Set<string>>();
  for (const doc of completedDocs) {
    if (!completedByCourse.has(doc.courseId)) completedByCourse.set(doc.courseId, new Set());
    completedByCourse.get(doc.courseId)!.add(doc.type);
  }

  const url = baseUrl();
  let sent = 0;

  for (const course of courses) {
    const completedSet = completedByCourse.get(course.id) ?? new Set<string>();
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
        planningUrl: `${url}/instructor/courses/${course.id}/planning`,
      });
      sent++;
    } catch {
      // No interrumpir el loop si un email falla
    }
  }

  return { sent, total: courses.length };
}

/** Avisa a quien reprobó un examen y ya cumplió las 4 horas de espera. */
export async function recordatoriosDeReintentoDeExamen() {
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

  const failedSubmissions = await prisma.examSubmission.findMany({
    where: {
      passed: false,
      submittedAt: { lt: fourHoursAgo },
    },
    include: {
      enrollment: {
        include: {
          student: { select: { email: true, name: true } },
          course: { select: { title: true } },
        },
      },
    },
    take: 100, // Evitar timeouts procesando en lotes
  });

  const url = baseUrl();
  let notifiedCount = 0;

  for (const submission of failedSubmissions) {
    const { enrollment } = submission;
    const courseId = enrollment.courseId;
    const studentId = enrollment.studentId;

    // ¿Ya le avisamos de ESTE intento? El aviso tiene que ser posterior al envío.
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId: studentId,
        type: "exam_retry",
        link: `/dashboard/my-courses/${courseId}/exam`,
        createdAt: { gte: submission.submittedAt },
      },
    });

    if (existingNotification) continue;

    try {
      await prisma.notification.create({
        data: {
          userId: studentId,
          type: "exam_retry",
          title: "Examen disponible para reintento",
          body: `Ya puedes volver a realizar el examen final del curso "${enrollment.course.title}".`,
          link: `/dashboard/my-courses/${courseId}/exam`,
        },
      });

      if (enrollment.student.email) {
        await sendExamRetryEmail({
          to: enrollment.student.email,
          name: enrollment.student.name || "Estudiante",
          courseTitle: enrollment.course.title,
          examUrl: `${url}/dashboard/my-courses/${courseId}/exam`,
        });
      }

      notifiedCount++;
    } catch (err) {
      console.error(
        `[cron] Error al notificar al estudiante ${studentId} del curso ${courseId}:`,
        err,
      );
    }
  }

  return { notified: notifiedCount, checked: failedSubmissions.length };
}

/** Invita a reflexionar a quien ya asistió a una sesión presencial. */
export async function invitacionesDeReflexion() {
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

  return { sent, total: enrollments.length };
}
