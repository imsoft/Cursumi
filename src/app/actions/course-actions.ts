"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getInstructorCourses,
  createCourse,
  getCourseDetail,
  type InstructorCourseListItem,
  listPublishedCourses,
  listStudentCourses,
  listRecommendations,
  listCourseStudents,
  getPublishedCourse,
  getStudentCourseDetail,
} from "@/lib/course-service";
import type { CourseFormData } from "@/components/instructor/course-types";
import type { Course } from "@/components/courses/types";
import type { StudentCourse, Recommendation } from "@/components/student/types";
import type { CourseStudent, StudentCourseDetail } from "@/lib/course-service";
import { revalidatePath } from "next/cache";
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

export async function listInstructorCourses(): Promise<InstructorCourseListItem[]> {
  const session = await requireSession();
  return getInstructorCourses(session.user.id);
}

export async function listPublicCourses(): Promise<Course[]> {
  return listPublishedCourses();
}

export async function listMyCourses(): Promise<StudentCourse[]> {
  const session = await requireSession();
  return listStudentCourses(session.user.id);
}

export async function listRecommendationsForUser(): Promise<Recommendation[]> {
  const session = await requireSession();
  const myCourses = await listStudentCourses(session.user.id);
  const excludeIds = myCourses.map((c) => c.id);
  return listRecommendations(excludeIds);
}

export async function createCourseDraft(data: CourseFormData) {
  const session = await requireSession();
  return createCourse(session.user.id, { ...data, status: "draft" });
}

export async function publishCourse(data: CourseFormData) {
  const session = await requireSession();
  return createCourse(session.user.id, { ...data, status: "published" });
}

export async function getCourseDetailForUser(courseId: string) {
  const session = await requireSession();
  const course = await getCourseDetail(courseId);
  if (!course) {
    throw new Error("Curso no encontrado");
  }
  if (course.instructorId !== session.user.id) {
    throw new Error("No autorizado para ver este curso");
  }
  return course;
}

export async function listStudentsForCourse(courseId: string): Promise<CourseStudent[]> {
  const session = await requireSession();
  const course = await getCourseDetail(courseId);
  if (!course || course.instructorId !== session.user.id) {
    throw new Error("No autorizado");
  }
  return listCourseStudents(courseId);
}

export async function getPublishedCourseDetail(courseId: string) {
  return getPublishedCourse(courseId);
}

export async function enrollInCourse(courseId: string) {
  const session = await requireSession();
  const course = await getPublishedCourse(courseId);
  if (!course) {
    throw new Error("Curso no encontrado o no publicado");
  }

  await prisma.enrollment.upsert({
    where: {
      courseId_studentId: {
        courseId,
        studentId: session.user.id,
      },
    },
    update: {
      status: "active",
    },
    create: {
      courseId,
      studentId: session.user.id,
      status: "active",
      progress: 0,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/my-courses");
  revalidatePath(`/dashboard/explore/${courseId}`);
  return { enrolled: true };
}

export async function getMyCourseDetail(courseId: string): Promise<StudentCourseDetail | null> {
  const session = await requireSession();
  const detail = await getStudentCourseDetail(courseId, session.user.id);
  if (!detail) {
    return null;
  }
  return detail;
}
