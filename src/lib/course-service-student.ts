/**
 * Operaciones de course-service orientadas al estudiante:
 * mis cursos, recomendaciones, detalle de curso, visor de lección.
 */
import { Prisma } from "@/generated/prisma";
import type { SectionActivity } from "@/components/instructor/course-types";
import type { CourseFinalExam } from "@/components/instructor/course-types";
import type { StudentCourse, Recommendation } from "@/components/student/types";
import { gateActivityFromLesson, listSectionGateUnitsForUi } from "@/lib/gate-lesson-content";
import { normalizeSectionActivities } from "@/lib/section-activities";
import { formatMexicoLocation } from "@/lib/mexico-location-helpers";
import { prisma } from "./prisma";
import { formatDateLabel } from "./course-service-helpers";

// ─── Mis cursos ───────────────────────────────────────────────────────────────

export async function listStudentCourses(studentId: string): Promise<StudentCourse[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId,
      course: { status: { not: "archived" } },
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          modality: true,
          category: true,
          instructor: { select: { name: true } },
          startDate: true,
          imageUrl: true,
          status: true,
        },
      },
      lessonProgress: {
        orderBy: { completedAt: "desc" },
        take: 1,
        select: {
          lessonId: true,
          lesson: { select: { title: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((enrollment) => {
    const { course } = enrollment;
    const lastProgress = enrollment.lessonProgress[0];
    return {
      id: course.id,
      title: course.title,
      modality: course.modality,
      progress: enrollment.progress,
      nextSession: formatDateLabel(course.startDate) ?? undefined,
      instructorName: course.instructor?.name || "Instructor",
      category: course.category,
      status: enrollment.status === "completed" ? "completed" : "in-progress",
      startDate: formatDateLabel(course.startDate) ?? undefined,
      imageUrl:
        course.imageUrl ||
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop",
      lastLessonId: lastProgress?.lessonId,
      lastLessonTitle: lastProgress?.lesson?.title,
    };
  });
}

export async function listRecommendations(excludeCourseIds: string[]): Promise<Recommendation[]> {
  const courses = await prisma.course.findMany({
    where: {
      status: "published",
      NOT: { id: { in: excludeCourseIds } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      modality: true,
      imageUrl: true,
    },
  });

  return courses.map((course) => ({
    id: course.id,
    slug: course.slug ?? undefined,
    title: course.title,
    category: course.category,
    modality: course.modality,
    imageUrl:
      course.imageUrl ||
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=450",
  }));
}

// ─── Detalle de curso (enrolled) ──────────────────────────────────────────────

export type StudentCourseDetail = Prisma.PromiseReturnType<typeof getStudentCourseDetail>;

export async function getStudentCourseDetail(courseId: string, studentId: string) {
  const detail = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId } },
    include: {
      course: {
        include: {
          instructor: { select: { name: true, image: true } },
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
      },
      lessonProgress: { select: { lessonId: true } },
      examSubmission: { select: { passed: true, score: true } },
      sectionQuizSubmissions: { select: { sectionId: true, activityId: true, passed: true } },
      session: {
        select: {
          id: true,
          city: true,
          state: true,
          location: true,
          meetingUrl: true,
          date: true,
          startTime: true,
          endTime: true,
          maxStudents: true,
          _count: { select: { enrollments: true } },
        },
      },
    },
  });

  if (detail?.course) {
    // SECURITY: no filtrar respuestas del examen al cliente del dashboard
    // @ts-ignore
    delete detail.course.finalExam;
  }

  return detail;
}

// ─── Examen ───────────────────────────────────────────────────────────────────

export function sanitizeExamForClient(exam: CourseFinalExam): CourseFinalExam {
  return {
    ...exam,
    questions: exam.questions.map((q) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { correctAnswer, ...safeQuestion } = q;
      return safeQuestion as CourseFinalExam["questions"][number];
    }),
  };
}

// ─── Visor de lección ─────────────────────────────────────────────────────────

export async function getLessonForStudent(lessonId: string, studentId: string) {
  const lessonMeta = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { isFree: true, section: { select: { courseId: true } } },
  });
  if (!lessonMeta) return null;

  const courseId = lessonMeta.section.courseId;

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId } },
    include: {
      lessonProgress: { select: { lessonId: true, score: true, answers: true } },
      sectionQuizSubmissions: { select: { sectionId: true, activityId: true, passed: true } },
    },
  });
  if (!enrollment && !lessonMeta.isFree) return null;

  const [lesson, courseSections, courseData] = await Promise.all([
    prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          select: {
            id: true,
            title: true,
            order: true,
            quiz: true,
            minigame: true,
            activities: true,
            courseId: true,
          },
        },
      },
    }),
    prisma.courseSection.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        order: true,
        quiz: true,
        minigame: true,
        activities: true,
        lessons: {
          orderBy: { order: "asc" },
          select: { id: true, title: true, type: true, duration: true, order: true, content: true },
        },
      },
    }),
    prisma.course.findUnique({
      where: { id: courseId },
      select: { finalExam: true },
    }),
  ]);

  if (!lesson) return null;

  const hasFinalExam = !!(
    courseData?.finalExam &&
    (courseData.finalExam as { questions?: unknown[] }).questions?.length
  );

  const completedIds = new Set(enrollment?.lessonProgress.map((lp) => lp.lessonId) ?? []);

  const passedSectionIds = new Set<string>();
  for (const sec of courseSections) {
    const units = listSectionGateUnitsForUi(sec);
    if (units.length === 0) continue;
    const allPassed = units.every(
      (u) =>
        enrollment?.sectionQuizSubmissions.some(
          (s) => s.sectionId === u.sectionId && s.activityId === u.activityId && s.passed
        ) ?? false
    );
    if (allPassed) passedSectionIds.add(sec.id);
  }

  const allLessons = courseSections.flatMap((s) => s.lessons);
  const idx = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = idx > 0 ? allLessons[idx - 1] : null;
  const nextLesson = idx < allLessons.length - 1 ? allLessons[idx + 1] : null;

  const currentSection = courseSections.find((s) => s.id === lesson.sectionId);
  const sectionLessons = (currentSection?.lessons ?? []).slice().sort((a, b) => a.order - b.order);
  const isLastLessonInSection = sectionLessons[sectionLessons.length - 1]?.id === lessonId;

  let currentSectionGateActivities: SectionActivity[] = [];
  if (lesson.type === "section_quiz" || lesson.type === "section_minigame") {
    const g = gateActivityFromLesson(lesson);
    if (g) currentSectionGateActivities = [g];
  } else if (isLastLessonInSection && currentSection) {
    const legacy = normalizeSectionActivities(currentSection);
    if (legacy.length > 0) currentSectionGateActivities = legacy;
  }

  const sectionGateCompletion: Record<string, boolean> = {};
  for (const act of currentSectionGateActivities) {
    sectionGateCompletion[act.id] =
      enrollment?.sectionQuizSubmissions.some(
        (s) => s.sectionId === lesson.sectionId && s.activityId === act.id && s.passed
      ) ?? false;
  }

  const sectionGatesAllPassed =
    currentSectionGateActivities.length === 0 ||
    currentSectionGateActivities.every((a) => sectionGateCompletion[a.id]);

  const nextLessonSectionId = nextLesson
    ? courseSections.find((s) => s.lessons.some((l) => l.id === nextLesson.id))?.id ?? null
    : null;

  const currentLessonProgress = enrollment?.lessonProgress.find((lp) => lp.lessonId === lessonId);
  const savedQuizScore = currentLessonProgress?.score ?? null;
  const savedQuizAnswers = currentLessonProgress?.answers ?? null;

  const sidebarSections = courseSections.map((s) => {
    const units = listSectionGateUnitsForUi(s);
    const gatesPassed = units.filter(
      (u) =>
        enrollment?.sectionQuizSubmissions.some(
          (ss) => ss.sectionId === u.sectionId && ss.activityId === u.activityId && ss.passed
        ) ?? false
    ).length;
    return {
      id: s.id,
      title: s.title,
      gateTotal: units.length,
      gatesPassed,
      lessons: s.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        duration: l.duration ?? null,
        order: l.order,
      })),
    };
  });

  return {
    lesson,
    enrollment,
    completedIds,
    prevLesson,
    nextLesson,
    courseId,
    sidebarSections,
    currentSectionGateActivities,
    sectionGateCompletion,
    sectionGatesAllPassed,
    isLastLessonInSection,
    passedSectionIds,
    nextLessonSectionId,
    currentSectionId: lesson.sectionId,
    hasFinalExam,
    savedQuizScore,
    savedQuizAnswers,
  };
}

// ─── Alias para acceso a sesión de estudiante presencial ─────────────────────

export async function getStudentSessionDetail(enrollmentId: string) {
  return prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      session: {
        select: {
          city: true,
          state: true,
          location: true,
          meetingUrl: true,
          date: true,
          startTime: true,
          endTime: true,
        },
      },
    },
  });
}

export { formatMexicoLocation };
