import { prisma } from "./prisma";
import type { Prisma, CourseStatus, CourseType, Modality, LessonType, EnrollmentStatus } from "@/generated/prisma";
import type { CourseFormData, CourseSection } from "@/components/instructor/course-types";
import type { Course } from "@/components/courses/types";
import type { StudentCourse, Recommendation } from "@/components/student/types";

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
  return date.toISOString();
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
  return prisma.course.create({
    data: {
      instructorId,
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
      status: data.status ?? "draft",
      finalExam: data.finalExam ? (data.finalExam as object) : undefined,
      sections: data.sections
        ? {
            create: data.sections.map((section, index) => ({
              title: section.title,
              description: section.description,
              order: section.order ?? index + 1,
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
      _count: { select: { enrollments: true } },
    },
  });
}

interface CourseFilters {
  search?: string;
  category?: string;
  modality?: string;
  level?: string;
}

export async function listPublishedCourses(filters: CourseFilters = {}): Promise<Course[]> {
  const { search, category, modality, level } = filters;

  const courses = await prisma.course.findMany({
    where: {
      status: "published",
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(category && { category: { contains: category, mode: "insensitive" } }),
      ...(modality && { modality: modality as Modality }),
      ...(level && { level: { contains: level, mode: "insensitive" } }),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
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
  });

  return courses.map((course) => ({
    id: course.id,
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
}

export async function getPublishedCourse(courseId: string) {
  return prisma.course.findFirst({
    where: { id: courseId, status: "published" },
    include: {
      instructor: { select: { name: true } },
      _count: { select: { enrollments: true } },
      reviews: {
        select: { rating: true, comment: true, user: { select: { name: true } }, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function listStudentCourses(studentId: string): Promise<StudentCourse[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
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
      title: true,
      category: true,
      modality: true,
      imageUrl: true,
    },
  });

  return courses.map((course) => ({
    id: course.id,
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
  name: string | null;
  email: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledDate: string;
};

export async function listCourseStudents(courseId: string): Promise<CourseStudent[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: {
      student: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((enrollment) => ({
    id: enrollment.student.id,
    name: enrollment.student.name,
    email: enrollment.student.email,
    status: enrollment.status,
    progress: enrollment.progress,
    enrolledDate: enrollment.createdAt.toISOString(),
  }));
}

export type StudentCourseDetail = Prisma.PromiseReturnType<typeof getStudentCourseDetail>;

export async function getStudentCourseDetail(courseId: string, studentId: string) {
  return prisma.enrollment.findUnique({
    where: {
      courseId_studentId: {
        courseId,
        studentId,
      },
    },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
          sections: {
            orderBy: { order: "asc" },
            include: { lessons: { orderBy: { order: "asc" } } },
          },
          _count: { select: { enrollments: true } },
        },
      },
      lessonProgress: { select: { lessonId: true } },
    },
  });
}

export async function getLessonForStudent(lessonId: string, studentId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      section: {
        include: {
          course: {
            include: {
              sections: {
                orderBy: { order: "asc" },
                include: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, type: true, duration: true, order: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson) return null;

  const courseId = lesson.section.courseId;

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId } },
    include: { lessonProgress: { select: { lessonId: true } } },
  });

  if (!enrollment) return null;

  const completedIds = new Set(enrollment.lessonProgress.map((lp) => lp.lessonId));

  // Flatten all lessons in order to find prev/next
  const allLessons = lesson.section.course.sections.flatMap((s) => s.lessons);
  const idx = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = idx > 0 ? allLessons[idx - 1] : null;
  const nextLesson = idx < allLessons.length - 1 ? allLessons[idx + 1] : null;

  return {
    lesson,
    enrollment,
    completedIds,
    prevLesson,
    nextLesson,
    courseId,
    sections: lesson.section.course.sections,
  };
}
