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

export async function listPublishedCourses(): Promise<Course[]> {
  const courses = await prisma.course.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      modality: true,
      category: true,
      city: true,
      description: true,
      duration: true,
      imageUrl: true,
    },
  });

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    modality: course.modality,
    category: course.category,
    city: course.city || "Online",
    description: course.description,
    duration: course.duration || "A tu ritmo",
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
    },
  });
}
