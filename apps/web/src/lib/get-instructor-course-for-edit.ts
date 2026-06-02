import "server-only";

import { getCachedSession } from "@/lib/session";
import { getCourseDetail } from "@/lib/course-service";

/**
 * Datos del curso para la página de edición (solo el instructor dueño).
 * Vive fuera de `course-actions` (`"use server"`) para evitar problemas al
 * invocar desde Server Components.
 */
export async function getCourseDetailForEditPage(courseId: string) {
  try {
    const session = await getCachedSession();

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
  } catch (error) {
    console.error("[getCourseDetailForEditPage] Error:", error);
    return null;
  }
}
