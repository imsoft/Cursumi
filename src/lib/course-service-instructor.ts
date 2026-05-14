/**
 * Operaciones de course-service orientadas al instructor:
 * CRUD de cursos, secciones, lecciones, sesiones y vista de progreso.
 */
import { Prisma } from "@/generated/prisma";
import type { CourseStatus, CourseType, Modality, LessonType, EnrollmentStatus } from "@/generated/prisma";
import type { CourseFormData, CourseSection, CourseSessionData } from "@/components/instructor/course-types";
import { hashJoinCode, shouldUseFreeJoinCode } from "@/lib/join-code";
import { formatMexicoLocation } from "@/lib/mexico-location-helpers";
import { listSectionGateUnitsForUi } from "@/lib/gate-lesson-content";
import { prisma } from "./prisma";
import {
  sectionJsonForPrisma,
  generateCourseSlug,
  formatDateLabel,
  startOfTodayUTC,
  computeNextSessionFromData,
  recalculateAllEnrollments,
} from "./course-service-helpers";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InstructorCourseListItem = {
  id: string;
  title: string;
  modality: Modality;
  status: CourseStatus;
  category: string;
  studentsCount: number;
  nextSession?: string;
};

export type CourseStudent = {
  id: string;
  enrollmentId: string;
  name: string | null;
  email: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledDate: string;
  sessionId?: string | null;
  sessionLabel?: string;
};

export type UpcomingSessionItem = {
  sessionId: string;
  courseId: string;
  courseTitle: string;
  city: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  enrolledCount: number;
  maxStudents: number;
};

export type StudentProgressDetail = {
  id: string;
  enrollmentId: string;
  name: string | null;
  email: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledDate: string;
  sessionId: string | null;
  sessionLabel?: string;
  completedLessonIds: string[];
  lessonScores: Record<string, number>;
  sectionQuizzes: { sectionId: string; activityId: string; score: number; passed: boolean }[];
  examSubmission: { score: number; passed: boolean; submittedAt: string } | null;
  certificateType: string | null;
};

export type CourseSession = {
  id: string;
  label: string;
  enrolledCount: number;
};

export type CourseProgressOverview = {
  sections: {
    id: string;
    title: string;
    hasQuiz: boolean;
    lessons: { id: string; title: string; type: string }[];
  }[];
  hasFinalExam: boolean;
  students: StudentProgressDetail[];
  sessions: CourseSession[];
};

type CreateCourseInput = Omit<CourseFormData, "sections"> & {
  sections?: CourseSection[];
  status?: CourseStatus;
};

type UpdateCourseInput = CreateCourseInput & { id: string };

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getInstructorCourses(instructorId: string): Promise<InstructorCourseListItem[]> {
  const courses = await prisma.course.findMany({
    where: { instructorId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      modality: true,
      status: true,
      category: true,
      nextSession: true,
      _count: { select: { enrollments: true } },
    },
  });

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    modality: course.modality,
    status: course.status,
    category: course.category,
    studentsCount: course._count.enrollments,
    nextSession: formatDateLabel(course.nextSession),
  }));
}

export async function createCourse(instructorId: string, data: CreateCourseInput) {
  const instructor = await prisma.user.findUnique({ where: { id: instructorId }, select: { name: true } });
  const slug = await generateCourseSlug(data.title, instructor?.name || instructorId);
  let joinCodeHash: string | null = null;
  if (shouldUseFreeJoinCode(data.modality, data.price) && data.freeJoinCode?.trim()) {
    joinCodeHash = await hashJoinCode(data.freeJoinCode.trim());
  }
  return prisma.course.create({
    data: {
      instructorId,
      slug,
      title: data.title,
      description: data.description,
      category: data.category,
      level: data.level || "principiante",
      modality: data.modality as Modality,
      city: data.city,
      state: data.state,
      location: data.location,
      mapsUrl: data.mapsUrl || null,
      courseType: data.courseType as CourseType,
      startDate: data.startDate ? new Date(data.startDate) : null,
      duration: data.duration,
      price: data.price,
      maxStudents: data.maxStudents,
      imageUrl: data.imageUrl,
      joinCodeHash,
      status: data.status ?? "draft",
      nextSession: computeNextSessionFromData(data.courseSessions),
      finalExam: data.finalExam ? (data.finalExam as object) : undefined,
      courseSessions: data.courseSessions?.length
        ? {
            create: await Promise.all(data.courseSessions.map(async (s) => ({
              city: s.city,
              state: s.state,
              location: s.location,
              meetingUrl: s.meetingUrl?.trim() || null,
              date: new Date(s.date),
              startTime: s.startTime,
              endTime: s.endTime,
              maxStudents: s.maxStudents,
              joinCodeHash: s.joinCode?.trim() ? await hashJoinCode(s.joinCode.trim()) : null,
            }))),
          }
        : undefined,
      sections: data.sections
        ? {
            create: data.sections.map((section, index) => ({
              title: section.title,
              description: section.description,
              order: section.order ?? index + 1,
              ...sectionJsonForPrisma(section),
              lessons: {
                create: section.lessons?.map((lesson, lessonIndex) => ({
                  title: lesson.title,
                  description: lesson.description,
                  type: lesson.type as LessonType,
                  duration: lesson.duration,
                  order: lesson.order ?? lessonIndex + 1,
                  videoUrl: lesson.videoUrl,
                  content: lesson.content,
                  attachments: lesson.files?.length ? (lesson.files as object[]) : undefined,
                  resources: lesson.resources?.length ? (lesson.resources as object[]) : undefined,
                })) || [],
              },
            })),
          }
        : undefined,
    },
  });
}

export async function updateCourse(courseId: string, instructorId: string, data: UpdateCourseInput) {
  const existing = await prisma.course.findFirst({
    where: { id: courseId, instructorId },
    include: {
      instructor: { select: { name: true } },
      sections: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!existing) throw new Error("Curso no encontrado o no autorizado");

  const titleChanged = data.title && data.title !== existing.title;
  const slug = titleChanged
    ? await generateCourseSlug(data.title, existing.instructor.name || instructorId, courseId)
    : undefined;

  const nextModality = data.modality ?? existing.modality;
  const nextPrice = data.price !== undefined ? data.price : existing.price;
  let joinCodeHash: string | null | undefined = undefined;
  if (nextModality === "virtual" || nextPrice > 0) {
    joinCodeHash = null;
  } else if (data.clearFreeJoinCode) {
    joinCodeHash = null;
  } else if (data.freeJoinCode !== undefined && data.freeJoinCode.trim().length > 0) {
    joinCodeHash = await hashJoinCode(data.freeJoinCode.trim());
  }

  await prisma.course.update({
    where: { id: courseId },
    data: {
      ...(slug ? { slug } : {}),
      title: data.title,
      description: data.description,
      category: data.category,
      level: data.level || "principiante",
      modality: data.modality as Modality,
      city: data.city,
      state: data.state,
      location: data.location,
      mapsUrl: data.mapsUrl || null,
      courseType: data.courseType as CourseType,
      startDate: data.startDate ? new Date(data.startDate) : null,
      duration: data.duration,
      price: data.price,
      maxStudents: data.maxStudents,
      imageUrl: data.imageUrl,
      status: data.status ?? existing.status,
      finalExam: data.finalExam ? (data.finalExam as object) : undefined,
      ...(joinCodeHash !== undefined ? { joinCodeHash } : {}),
    },
  });

  const existingSectionIds = new Set(existing.sections.map((s) => s.id));
  const payloadSectionIds = new Set((data.sections ?? []).map((s) => s.id).filter(Boolean));

  for (const section of data.sections ?? []) {
    const sectionPayload = {
      title: section.title,
      description: section.description,
      order: section.order ?? 0,
      lessons: section.lessons ?? [],
    };

    if (section.id && existingSectionIds.has(section.id)) {
      await prisma.courseSection.update({
        where: { id: section.id },
        data: {
          title: sectionPayload.title,
          description: sectionPayload.description ?? null,
          order: sectionPayload.order,
          ...sectionJsonForPrisma(section),
        },
      });

      const existingLessons = existing.sections.find((s) => s.id === section.id)?.lessons ?? [];
      const existingLessonIds = new Set(existingLessons.map((l) => l.id));
      const payloadLessonIds = new Set(sectionPayload.lessons.map((l) => l.id).filter(Boolean));

      for (let i = 0; i < sectionPayload.lessons.length; i++) {
        const lesson = sectionPayload.lessons[i];
        const order = lesson.order ?? i + 1;
        const lessonData = {
          title: lesson.title,
          description: lesson.description ?? null,
          type: lesson.type as LessonType,
          duration: lesson.duration ?? null,
          order,
          videoUrl: lesson.videoUrl ?? null,
          content: lesson.content ?? null,
          attachments: lesson.files?.length ? (lesson.files as object[]) : undefined,
          resources: lesson.resources?.length ? (lesson.resources as object[]) : undefined,
        };
        if (lesson.id && existingLessonIds.has(lesson.id)) {
          await prisma.lesson.update({ where: { id: lesson.id }, data: lessonData });
        } else {
          await prisma.lesson.create({ data: { sectionId: section.id, ...lessonData } });
        }
      }

      const toDelete = existingLessons.filter((l) => !payloadLessonIds.has(l.id));
      for (const l of toDelete) {
        await prisma.lesson.delete({ where: { id: l.id } });
      }
    } else {
      const created = await prisma.courseSection.create({
        data: {
          courseId,
          title: sectionPayload.title,
          description: sectionPayload.description ?? null,
          order: sectionPayload.order,
          ...sectionJsonForPrisma(section),
          lessons: {
            create: sectionPayload.lessons.map((lesson, lessonIndex) => ({
              title: lesson.title,
              description: lesson.description ?? null,
              type: lesson.type as LessonType,
              duration: lesson.duration ?? null,
              order: lesson.order ?? lessonIndex + 1,
              videoUrl: lesson.videoUrl ?? null,
              content: lesson.content ?? null,
              attachments: lesson.files?.length ? (lesson.files as object[]) : undefined,
              resources: lesson.resources?.length ? (lesson.resources as object[]) : undefined,
            })),
          },
        },
      });
      existingSectionIds.add(created.id);
    }
  }

  const sectionsToDelete = existing.sections.filter((s) => !payloadSectionIds.has(s.id));
  for (const s of sectionsToDelete) {
    await prisma.courseSection.delete({ where: { id: s.id } });
  }

  await recalculateAllEnrollments(courseId);
  return getCourseDetail(courseId);
}

export async function getCourseDetail(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      sections: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
      courseSessions: {
        orderBy: { date: "asc" },
        include: { _count: { select: { enrollments: true } } },
      },
      _count: { select: { enrollments: true } },
    },
  });
}

// ─── Secciones y lecciones individuales ──────────────────────────────────────

export async function createSection(courseId: string, title: string, order: number) {
  return prisma.courseSection.create({ data: { courseId, title, order } });
}

export async function deleteSection(sectionId: string) {
  await prisma.courseSection.delete({ where: { id: sectionId } });
}

export async function updateSectionData(
  sectionId: string,
  data: {
    title?: string;
    description?: string;
    quiz?: object | null;
    minigame?: object | null;
    activities?: object | null;
  }
) {
  await prisma.courseSection.update({
    where: { id: sectionId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.quiz !== undefined && { quiz: data.quiz ?? Prisma.JsonNull }),
      ...(data.minigame !== undefined && { minigame: data.minigame ?? Prisma.JsonNull }),
      ...(data.activities !== undefined && { activities: data.activities ?? Prisma.JsonNull }),
    },
  });
}

export async function createLesson(sectionId: string, data: { title: string; type: LessonType; order: number }) {
  return prisma.lesson.create({ data: { sectionId, ...data } });
}

export async function deleteLessonById(lessonId: string) {
  await prisma.lesson.delete({ where: { id: lessonId } });
}

export async function getLessonById(lessonId: string) {
  return prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { section: { select: { courseId: true } } },
  });
}

export async function updateLessonById(
  lessonId: string,
  data: {
    title?: string;
    description?: string | null;
    type?: LessonType;
    duration?: string | null;
    videoUrl?: string | null;
    content?: string | null;
    attachments?: object[] | null;
    resources?: object[] | null;
    isFree?: boolean;
  }
) {
  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.duration !== undefined && { duration: data.duration }),
      ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.attachments !== undefined && { attachments: data.attachments ?? Prisma.JsonNull }),
      ...(data.resources !== undefined && { resources: data.resources ?? Prisma.JsonNull }),
      ...(data.isFree !== undefined && { isFree: data.isFree }),
    },
  });
}

export async function getCourseExam(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { finalExam: true },
  });
  return course?.finalExam ?? null;
}

export async function saveCourseExam(courseId: string, exam: object | null) {
  await prisma.course.update({
    where: { id: courseId },
    data: { finalExam: exam ?? Prisma.JsonNull },
  });
}

export async function updateCourseInfo(
  courseId: string,
  instructorId: string,
  data: {
    title?: string; description?: string; category?: string; level?: string;
    modality?: string; city?: string | null; state?: string | null; location?: string | null;
    courseType?: string; startDate?: string | null; duration?: string | null;
    price?: number; maxStudents?: number | null; imageUrl?: string | null;
    freeJoinCode?: string;
    clearFreeJoinCode?: boolean;
  }
) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, instructorId },
    include: { instructor: { select: { name: true } } },
  });
  if (!course) throw new Error("No autorizado");

  const slug =
    data.title && data.title !== course.title
      ? await generateCourseSlug(data.title, course.instructor.name || instructorId, courseId)
      : undefined;

  const nextModality = (data.modality ?? course.modality) as Modality;
  const nextPrice = data.price !== undefined ? data.price : course.price;
  let joinCodeHash: string | null | undefined = undefined;
  if (nextModality === "virtual" || nextPrice > 0) {
    joinCodeHash = null;
  } else if (data.clearFreeJoinCode) {
    joinCodeHash = null;
  } else if (data.freeJoinCode !== undefined && data.freeJoinCode.trim().length > 0) {
    joinCodeHash = await hashJoinCode(data.freeJoinCode.trim());
  }

  await prisma.course.update({
    where: { id: courseId },
    data: {
      ...(slug ? { slug } : {}),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.level !== undefined && { level: data.level }),
      ...(data.modality !== undefined && { modality: data.modality as Modality }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.state !== undefined && { state: data.state }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.courseType !== undefined && { courseType: data.courseType as CourseType }),
      ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
      ...(data.duration !== undefined && { duration: data.duration }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.maxStudents !== undefined && { maxStudents: data.maxStudents }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(joinCodeHash !== undefined ? { joinCodeHash } : {}),
    },
  });
}

// ─── Estudiantes del curso ────────────────────────────────────────────────────

export async function listCourseStudents(courseId: string, sessionId?: string): Promise<CourseStudent[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId, ...(sessionId ? { sessionId } : {}) },
    include: {
      student: { select: { id: true, name: true, email: true } },
      session: { select: { id: true, city: true, state: true, date: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((enrollment) => ({
    id: enrollment.student.id,
    enrollmentId: enrollment.id,
    name: enrollment.student.name,
    email: enrollment.student.email,
    status: enrollment.status,
    progress: enrollment.progress,
    enrolledDate: enrollment.createdAt.toISOString(),
    sessionId: enrollment.sessionId,
    sessionLabel: enrollment.session
      ? `${formatMexicoLocation(enrollment.session.city, enrollment.session.state)} — ${enrollment.session.date.toLocaleDateString("es-MX", { timeZone: "UTC" })}`
      : undefined,
  }));
}

export async function getCourseStudentsProgress(courseId: string): Promise<CourseProgressOverview> {
  const [course, enrollments, courseSessions] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      select: {
        finalExam: true,
        sections: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            quiz: true,
            minigame: true,
            activities: true,
            lessons: {
              orderBy: { order: "asc" },
              select: { id: true, title: true, type: true, content: true },
            },
          },
        },
      },
    }),
    prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        session: { select: { id: true, city: true, state: true, date: true, location: true } },
        lessonProgress: { select: { lessonId: true, score: true } },
        sectionQuizSubmissions: {
          select: { sectionId: true, activityId: true, score: true, passed: true },
        },
        examSubmission: { select: { score: true, passed: true, submittedAt: true } },
        certificate: { select: { type: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.courseSession.findMany({
      where: { courseId },
      orderBy: { date: "asc" },
      select: {
        id: true,
        city: true,
        state: true,
        location: true,
        date: true,
        _count: { select: { enrollments: true } },
      },
    }),
  ]);

  const hasFinalExam = !!(
    course?.finalExam &&
    (course.finalExam as { questions?: unknown[] }).questions?.length
  );

  const sections = (course?.sections ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    hasQuiz: listSectionGateUnitsForUi(s).length > 0,
    lessons: s.lessons.map((l) => ({ id: l.id, title: l.title, type: l.type })),
  }));

  const students: StudentProgressDetail[] = enrollments.map((e) => ({
    id: e.student.id,
    enrollmentId: e.id,
    name: e.student.name,
    email: e.student.email,
    status: e.status,
    progress: e.progress,
    enrolledDate: e.createdAt.toISOString(),
    sessionId: e.sessionId,
    sessionLabel: e.session
      ? `${formatMexicoLocation(e.session.city, e.session.state)} — ${e.session.date.toLocaleDateString("es-MX", { timeZone: "UTC" })}`
      : undefined,
    completedLessonIds: e.lessonProgress.map((lp) => lp.lessonId),
    lessonScores: Object.fromEntries(
      e.lessonProgress.filter((lp) => lp.score != null).map((lp) => [lp.lessonId, lp.score!])
    ),
    sectionQuizzes: e.sectionQuizSubmissions.map((sq) => ({
      activityId: sq.activityId,
      sectionId: sq.sectionId,
      score: sq.score,
      passed: sq.passed,
    })),
    examSubmission: e.examSubmission
      ? {
          score: e.examSubmission.score,
          passed: e.examSubmission.passed,
          submittedAt: e.examSubmission.submittedAt.toISOString(),
        }
      : null,
    certificateType: e.certificate?.type ?? null,
  }));

  const sessions: CourseSession[] = courseSessions.map((s) => ({
    id: s.id,
    label: `${formatMexicoLocation(s.city, s.state)}${s.location ? ` · ${s.location}` : ""} — ${s.date.toLocaleDateString("es-MX", { timeZone: "UTC" })}`,
    enrolledCount: s._count.enrollments,
  }));

  return { sections, hasFinalExam, students, sessions };
}

// ─── Sesiones presenciales ────────────────────────────────────────────────────

export async function upsertCourseSessions(courseId: string, sessions: CourseSessionData[]) {
  const payloadIds = sessions.filter((s) => s.id).map((s) => s.id!);
  await prisma.courseSession.deleteMany({ where: { courseId, id: { notIn: payloadIds } } });

  for (const s of sessions) {
    // Compute joinCodeHash for this session
    let sessionJoinCodeHash: string | null | undefined = undefined;
    if (s.clearJoinCode) {
      sessionJoinCodeHash = null;
    } else if (s.joinCode?.trim()) {
      sessionJoinCodeHash = await hashJoinCode(s.joinCode.trim());
    }

    const data = {
      city: s.city,
      state: s.state,
      location: s.location,
      meetingUrl: s.meetingUrl?.trim() || null,
      date: new Date(s.date),
      startTime: s.startTime,
      endTime: s.endTime,
      maxStudents: s.maxStudents,
      ...(sessionJoinCodeHash !== undefined ? { joinCodeHash: sessionJoinCodeHash } : {}),
    };
    if (s.id) {
      await prisma.courseSession.update({ where: { id: s.id }, data });
    } else {
      await prisma.courseSession.create({ data: { courseId, ...data } });
    }
  }

  const nextDate = await prisma.courseSession.findFirst({
    where: { courseId, date: { gte: startOfTodayUTC() } },
    orderBy: { date: "asc" },
    select: { date: true },
  });
  await prisma.course.update({
    where: { id: courseId },
    data: { nextSession: nextDate?.date ?? null },
  });
}

export async function getCourseSessions(courseId: string) {
  return prisma.courseSession.findMany({
    where: { courseId },
    orderBy: { date: "asc" },
    include: { _count: { select: { enrollments: true } } },
  });
}

export async function getUpcomingSessionsForInstructor(
  instructorId: string,
  limit = 10
): Promise<UpcomingSessionItem[]> {
  const sessions = await prisma.courseSession.findMany({
    where: {
      date: { gte: startOfTodayUTC() },
      course: { instructorId },
    },
    orderBy: { date: "asc" },
    take: limit,
    include: {
      course: { select: { id: true, title: true } },
      _count: { select: { enrollments: true } },
    },
  });

  return sessions.map((s) => ({
    sessionId: s.id,
    courseId: s.course.id,
    courseTitle: s.course.title,
    city: s.city,
    location: s.location,
    date: s.date.toISOString(),
    startTime: s.startTime,
    endTime: s.endTime,
    enrolledCount: s._count.enrollments,
    maxStudents: s.maxStudents,
  }));
}
