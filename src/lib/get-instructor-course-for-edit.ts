import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCourseDetail } from "@/lib/course-service";

/**
 * Datos del curso para la página de edición (solo el instructor dueño).
 * Vive fuera de `course-actions` (`"use server"`) para evitar problemas al
 * invocar desde Server Components.
 */
export async function getCourseDetailForEditPage(courseId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const course = await getCourseDetail(courseId);
  if (!course) {
    return null;
  }

  if (course.instructorId !== session.user.id) {
    return null;
  }

  return course;
}
