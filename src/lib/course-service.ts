import { prisma } from "./prisma";
import { Prisma } from "@/generated/prisma";
import type { CourseStatus, CourseType, Modality, LessonType, EnrollmentStatus } from "@/generated/prisma";
import type { CourseFormData, CourseSection, CourseSessionData } from "@/components/instructor/course-types";
import { hashJoinCode, shouldUseFreePresencialJoinCode } from "@/lib/join-code";
import type { Course } from "@/components/courses/types";
import type { StudentCourse, Recommendation } from "@/components/student/types";

/**
 * Recalcula el progreso de TODOS los enrollments de un curso.
 * Se usa cuando el instructor modifica la estructura del curso (agrega/elimina lecciones, secciones, etc.)
 */
async function recalculateAllEnrollments(courseId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    select: { id: true },
  });
  if (enrollments.length === 0) return;

  const [totalLessons, sections, course] = await Promise.all([
    prisma.lesson.count({ where: { section: { courseId } } }),
    prisma.courseSection.findMany({
      where: { courseId },
      select: { id: true, quiz: true, minigame: true },
    }),
    prisma.course.findUnique({
      where: { id: courseId },
      select: { finalExam: true },
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

  for (const enrollment of enrollments) {
    const [completedLessons, passedGates, examSubmission] = await Promise.all([
      prisma.lessonProgress.count({ where: { enrollmentId: enrollment.id } }),
      prisma.sectionQuizSubmission.count({
        where: { enrollmentId: enrollment.id, passed: true },
      }),
      prisma.examSubmission.findUnique({
        where: { enrollmentId: enrollment.id },
        select: { passed: true },
      }),
    ]);

    const completedUnits =
      completedLessons + passedGates + (examSubmission?.passed ? 1 : 0);
    const progress = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { progress },
    });
  }
}

function toSlugPart(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function generateCourseSlug(title: string, instructorName: string, excludeId?: string): Promise<string> {
  const base = `${toSlugPart(title)}-por-${toSlugPart(instructorName)}`;
  let slug = base;
  let counter = 2;
  while (true) {
    const existing = await prisma.course.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (!existing) return slug;
    slug = `${base}-${counter++}`;
  }
}

export type InstructorCourseListItem = {
  id: string;
  title: string;
  modality: Modality;
  status: CourseStatus;
  category: string;
  studentsCount: number;
  nextSession?: string;
};

function formatDateLabel(date: Date | null): string | undefined {
  if (!date) return undefined;
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Inicio del día actual en UTC (para comparar contra fechas de sesiones guardadas como YYYY-MM-DDT00:00:00Z) */
function startOfTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** Calcula la próxima sesión futura a partir de un array de sesiones (para crear/actualizar cursos) */
function computeNextSessionFromData(sessions?: CourseSessionData[]): Date | null {
  if (!sessions?.length) return null;
  const todayStart = startOfTodayUTC();
  const futureDates = sessions
    .map((s) => new Date(s.date))
    .filter((d) => d >= todayStart)
    .sort((a, b) => a.getTime() - b.getTime());
  return futureDates[0] ?? null;
}

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

type CreateCourseInput = Omit<CourseFormData, "sections"> & {
  sections?: CourseSection[];
  status?: CourseStatus;
};

export async function createCourse(instructorId: string, data: CreateCourseInput) {
  const instructor = await prisma.user.findUnique({ where: { id: instructorId }, select: { name: true } });
  const slug = await generateCourseSlug(data.title, instructor?.name || instructorId);
  let joinCodeHash: string | null = null;
  if (shouldUseFreePresencialJoinCode(data.modality, data.price) && data.freeJoinCode?.trim()) {
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
      location: data.location,
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
            create: data.courseSessions.map((s) => ({
              city: s.city,
              location: s.location,
              date: new Date(s.date),
              startTime: s.startTime,
              endTime: s.endTime,
              maxStudents: s.maxStudents,
            })),
          }
        : undefined,
      sections: data.sections
        ? {
            create: data.sections.map((section, index) => ({
              title: section.title,
              description: section.description,
              order: section.order ?? index + 1,
              quiz: section.quiz ? (section.quiz as object) : undefined,
              minigame: section.minigame ? (section.minigame as object) : undefined,
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

type UpdateCourseInput = CreateCourseInput & { id: string };

export async function updateCourse(
  courseId: string,
  instructorId: string,
  data: UpdateCourseInput
) {
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
  if (!existing) {
    throw new Error("Curso no encontrado o no autorizado");
  }

  const titleChanged = data.title && data.title !== existing.title;
  const slug = titleChanged
    ? await generateCourseSlug(data.title, existing.instructor.name || instructorId, courseId)
    : undefined;

  const nextModality = data.modality ?? existing.modality;
  const nextPrice = data.price !== undefined ? data.price : existing.price;
  let joinCodeHash: string | null | undefined = undefined;
  if (nextModality !== "presencial" || nextPrice > 0) {
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
      location: data.location,
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
          quiz: section.quiz ? (section.quiz as object) : Prisma.JsonNull,
          minigame: section.minigame ? (section.minigame as object) : Prisma.JsonNull,
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
          await prisma.lesson.update({
            where: { id: lesson.id },
            data: lessonData,
          });
        } else {
          await prisma.lesson.create({
            data: {
              sectionId: section.id,
              ...lessonData,
            },
          });
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
          quiz: section.quiz ? (section.quiz as object) : undefined,
          minigame: section.minigame ? (section.minigame as object) : undefined,
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

  // Recalculate progress for all enrolled students (structure may have changed)
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
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
      courseSessions: {
        orderBy: { date: "asc" },
        include: { _count: { select: { enrollments: true } } },
      },
      _count: { select: { enrollments: true } },
    },
  });
}

// ─── Individual section / lesson / exam operations ───────────────────────────

export async function createSection(courseId: string, title: string, order: number) {
  return prisma.courseSection.create({ data: { courseId, title, order } });
}

export async function deleteSection(sectionId: string) {
  await prisma.courseSection.delete({ where: { id: sectionId } });
}

export async function updateSectionData(
  sectionId: string,
  data: { title?: string; description?: string; quiz?: object | null; minigame?: object | null }
) {
  await prisma.courseSection.update({
    where: { id: sectionId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.quiz !== undefined && { quiz: data.quiz ?? Prisma.JsonNull }),
      ...(data.minigame !== undefined && { minigame: data.minigame ?? Prisma.JsonNull }),
    },
  });
}

export async function createLesson(
  sectionId: string,
  data: { title: string; type: LessonType; order: number }
) {
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
    modality?: string; city?: string | null; location?: string | null;
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
  if (nextModality !== "presencial" || nextPrice > 0) {
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

interface CourseFilters {
  search?: string;
  category?: string;
  modality?: string;
  level?: string;
  instructor?: string;
  minPrice?: number;
  maxPrice?: number;
  /** newest | price-asc | price-desc | popular */
  sortBy?: string;
}

const COURSES_PER_PAGE = 12;

export async function listPublishedCourses(
  filters: CourseFilters = {},
  page = 1,
  limit = COURSES_PER_PAGE
): Promise<{ courses: Course[]; total: number; hasMore: boolean }> {
  const { search, category, modality, level, instructor, minPrice, maxPrice, sortBy } = filters;

  type PrismaOrderBy = { createdAt?: "asc" | "desc"; price?: "asc" | "desc"; enrollments?: { _count: "asc" | "desc" } };
  const orderBy: PrismaOrderBy =
    sortBy === "price-asc"  ? { price: "asc" }
    : sortBy === "price-desc" ? { price: "desc" }
    : sortBy === "popular"    ? { enrollments: { _count: "desc" } }
    : { createdAt: "desc" };

  const where = {
    status: "published" as const,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { instructor: { name: { contains: search, mode: "insensitive" as const } } },
      ],
    }),
    ...(category && { category: { contains: category, mode: "insensitive" as const } }),
    ...(modality && { modality: modality as Modality }),
    ...(level && { level: { contains: level, mode: "insensitive" as const } }),
    ...(instructor && { instructor: { name: { contains: instructor, mode: "insensitive" as const } } }),
    ...(minPrice !== undefined && { price: { gte: minPrice } }),
    ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
  };

  const [raw, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        slug: true,
        title: true,
        modality: true,
        category: true,
        level: true,
        city: true,
        description: true,
        duration: true,
        price: true,
        imageUrl: true,
        instructor: { select: { name: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  const courses = raw.map((course) => ({
    id: course.id,
    slug: course.slug ?? undefined,
    title: course.title,
    modality: course.modality,
    category: course.category,
    level: course.level ?? undefined,
    city: course.city || "Online",
    description: course.description,
    duration: course.duration || "A tu ritmo",
    price: course.price,
    instructorName: course.instructor?.name ?? undefined,
    imageUrl:
      course.imageUrl ||
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80",
  }));

  return { courses, total, hasMore: page * limit < total };
}

/** Lightweight list for sitemap: id, slug and updatedAt of published courses */
export async function getPublishedCourseIdsForSitemap(): Promise<{ id: string; slug: string | null; updatedAt: Date }[]> {
  return prisma.course.findMany({
    where: { status: "published" },
    select: { id: true, slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPublishedCourse(slugOrId: string) {
  const course = await prisma.course.findFirst({
    where: { status: "published", OR: [{ id: slugOrId }, { slug: slugOrId }] },
    include: {
      instructor: { select: { name: true } },
      _count: { select: { enrollments: true } },
      reviews: {
        select: { rating: true, comment: true, user: { select: { name: true } }, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      sections: {
        select: {
          lessons: { select: { duration: true } },
        },
      },
      courseSessions: {
        orderBy: { date: "asc" },
        select: {
          id: true,
          city: true,
          location: true,
          date: true,
          startTime: true,
          endTime: true,
          maxStudents: true,
          _count: { select: { enrollments: true } },
        },
      },
    },
  });

  if (course) {
    // SECURITY: Delete finalExam to prevent leaking correct answers to the public API
    // @ts-ignore
    delete course.finalExam;
    const requiresJoinCode =
      course.modality === "presencial" && course.price === 0 && !!course.joinCodeHash;
    // @ts-expect-error no exponer hash
    delete course.joinCodeHash;
    return { ...course, requiresJoinCode };
  }

  return course;
}

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
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((enrollment) => {
    const { course } = enrollment;
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

export async function listCourseStudents(courseId: string, sessionId?: string): Promise<CourseStudent[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId, ...(sessionId ? { sessionId } : {}) },
    include: {
      student: { select: { id: true, name: true, email: true } },
      session: { select: { id: true, city: true, date: true } },
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
      ? `${enrollment.session.city} — ${enrollment.session.date.toLocaleDateString("es-MX", { timeZone: "UTC" })}`
      : undefined,
  }));
}

export type StudentCourseDetail = Prisma.PromiseReturnType<typeof getStudentCourseDetail>;

export async function getStudentCourseDetail(courseId: string, studentId: string) {
  const detail = await prisma.enrollment.findUnique({
    where: {
      courseId_studentId: {
        courseId,
        studentId,
      },
    },
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
      sectionQuizSubmissions: { select: { sectionId: true, passed: true } },
      session: {
        select: {
          id: true,
          city: true,
          location: true,
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
    // SECURITY: delete finalExam to prevent leakage on the regular student dashboard
    // @ts-ignore
    delete detail.course.finalExam;
  }

  return detail;
}

// ── Sanitize exams for client consumption ──
import type { CourseFinalExam } from "@/components/instructor/course-types";

/**
 * Removes the 'correctAnswer' from all questions in the final exam
 * so it can be securely sent to the client.
 */
export function sanitizeExamForClient(exam: CourseFinalExam): CourseFinalExam {
  return {
    ...exam,
    questions: exam.questions.map((q) => {
      const { correctAnswer, ...safeQuestion } = q;
      return safeQuestion as any;
    }),
  };
}

export async function getLessonForStudent(lessonId: string, studentId: string) {
  // Primero verificar que la lección existe y obtener el courseId con una query ligera
  const lessonMeta = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { section: { select: { courseId: true } } },
  });
  if (!lessonMeta) return null;

  const courseId = lessonMeta.section.courseId;

  // Verificar enrollment ANTES de cargar todo el curso (evita query pesada para usuarios no inscritos)
  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId } },
    include: {
      lessonProgress: { select: { lessonId: true, score: true, answers: true } },
      sectionQuizSubmissions: { select: { sectionId: true, passed: true } },
    },
  });
  if (!enrollment) return null;

  // Carga en paralelo: datos de la lección + índice ligero del curso (sidebar) + finalExam check
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
        lessons: {
          orderBy: { order: "asc" },
          select: { id: true, title: true, type: true, duration: true, order: true },
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

  const completedIds = new Set(enrollment.lessonProgress.map((lp) => lp.lessonId));
  const passedSectionIds = new Set(
    enrollment.sectionQuizSubmissions.filter((s) => s.passed).map((s) => s.sectionId)
  );

  // Flatten all lessons in order to find prev/next
  const allLessons = courseSections.flatMap((s) => s.lessons);
  const idx = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = idx > 0 ? allLessons[idx - 1] : null;
  const nextLesson = idx < allLessons.length - 1 ? allLessons[idx + 1] : null;

  // Current section info
  const currentSection = courseSections.find((s) => s.id === lesson.sectionId);
  const sectionLessons = (currentSection?.lessons ?? []).slice().sort((a, b) => a.order - b.order);
  const isLastLessonInSection = sectionLessons[sectionLessons.length - 1]?.id === lessonId;

  // Section quiz — validar estructura antes de exponer al cliente
  const rawQuiz = lesson.section.quiz as Record<string, unknown> | null;
  const sectionQuiz =
    rawQuiz &&
    typeof rawQuiz.passingScore === "number" &&
    Array.isArray(rawQuiz.questions) &&
    rawQuiz.questions.length > 0
      ? (rawQuiz as { passingScore: number; questions: { question: string; options: string[]; correct: number }[] })
      : null;
  const sectionQuizPassed = passedSectionIds.has(lesson.sectionId);

  // Section minigame — validar que tenga type reconocido
  const rawMinigame = lesson.section.minigame as Record<string, unknown> | null;
  const sectionMinigame =
    rawMinigame && ["memory", "hangman", "sort", "match"].includes(rawMinigame.type as string)
      ? (rawMinigame as
          | { type: "memory"; pairs: { term: string; definition: string }[] }
          | { type: "hangman"; words: { word: string; hint: string }[] }
          | { type: "sort"; instruction: string; items: string[] }
          | { type: "match"; instruction: string; pairs: { left: string; right: string }[] })
      : null;
  const sectionMinigamePassed = passedSectionIds.has(lesson.sectionId);

  // Next lesson's section ID (to detect cross-section navigation)
  const nextLessonSectionId = nextLesson
    ? courseSections.find((s) => s.lessons.some((l) => l.id === nextLesson.id))?.id ?? null
    : null;

  // Quiz submission for the current lesson (if it's a quiz type)
  const currentLessonProgress = enrollment.lessonProgress.find((lp) => lp.lessonId === lessonId);
  const savedQuizScore = currentLessonProgress?.score ?? null;
  const savedQuizAnswers = currentLessonProgress?.answers ?? null;

  return {
    lesson,
    enrollment,
    completedIds,
    prevLesson,
    nextLesson,
    courseId,
    sections: courseSections,
    sectionQuiz,
    sectionQuizPassed,
    sectionMinigame,
    sectionMinigamePassed,
    isLastLessonInSection,
    passedSectionIds,
    nextLessonSectionId,
    currentSectionId: lesson.sectionId,
    hasFinalExam,
    savedQuizScore,
    savedQuizAnswers,
  };
}

// ─── Sesiones presenciales ─────────────────────────────────────────────────

export async function upsertCourseSessions(
  courseId: string,
  sessions: CourseSessionData[]
) {
  // IDs que llegan del payload (existentes)
  const payloadIds = sessions.filter((s) => s.id).map((s) => s.id!);

  // Eliminar sesiones que ya no están en el payload
  await prisma.courseSession.deleteMany({
    where: { courseId, id: { notIn: payloadIds } },
  });

  // Upsert cada sesión
  for (const s of sessions) {
    const data = {
      city: s.city,
      location: s.location,
      date: new Date(s.date),
      startTime: s.startTime,
      endTime: s.endTime,
      maxStudents: s.maxStudents,
    };
    if (s.id) {
      await prisma.courseSession.update({ where: { id: s.id }, data });
    } else {
      await prisma.courseSession.create({ data: { courseId, ...data } });
    }
  }

  // Recompute nextSession on the course (incluye sesiones de hoy)
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

// ── Detalle de progreso de estudiantes para instructor ──

export type StudentProgressDetail = {
  id: string;
  enrollmentId: string;
  name: string | null;
  email: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledDate: string;
  sessionLabel?: string;
  completedLessonIds: string[];
  lessonScores: Record<string, number>; // lessonId → score
  sectionQuizzes: { sectionId: string; score: number; passed: boolean }[];
  examSubmission: { score: number; passed: boolean; submittedAt: string } | null;
  certificateType: string | null;
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
};

/** Fetch detailed progress for all students in a course (instructor view). */
export async function getCourseStudentsProgress(courseId: string): Promise<CourseProgressOverview> {
  const [course, enrollments] = await Promise.all([
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
            lessons: {
              orderBy: { order: "asc" },
              select: { id: true, title: true, type: true },
            },
          },
        },
      },
    }),
    prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        session: { select: { city: true, date: true } },
        lessonProgress: { select: { lessonId: true, score: true } },
        sectionQuizSubmissions: { select: { sectionId: true, score: true, passed: true } },
        examSubmission: { select: { score: true, passed: true, submittedAt: true } },
        certificate: { select: { type: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const hasFinalExam = !!(
    course?.finalExam &&
    (course.finalExam as { questions?: unknown[] }).questions?.length
  );

  const sections = (course?.sections ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    hasQuiz: !!(s.quiz && (s.quiz as { questions?: unknown[] }).questions?.length),
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
    sessionLabel: e.session
      ? `${e.session.city} — ${e.session.date.toLocaleDateString("es-MX", { timeZone: "UTC" })}`
      : undefined,
    completedLessonIds: e.lessonProgress.map((lp) => lp.lessonId),
    lessonScores: Object.fromEntries(
      e.lessonProgress.filter((lp) => lp.score != null).map((lp) => [lp.lessonId, lp.score!])
    ),
    sectionQuizzes: e.sectionQuizSubmissions.map((sq) => ({
      sectionId: sq.sectionId,
      score: sq.score,
      passed: sq.passed,
    })),
    examSubmission: e.examSubmission
      ? { score: e.examSubmission.score, passed: e.examSubmission.passed, submittedAt: e.examSubmission.submittedAt.toISOString() }
      : null,
    certificateType: e.certificate?.type ?? null,
  }));

  return { sections, hasFinalExam, students };
}
