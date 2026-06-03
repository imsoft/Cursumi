import { authClient } from "./auth";
import { API_URL } from "./api";

/**
 * Curso inscrito del usuario (forma de listStudentCourses en la web).
 */
export type StudentCourse = {
  id: string;
  title: string;
  modality?: string;
  progress: number; // 0–100
  instructorName: string;
  category?: { name?: string } | string | null;
  status: "completed" | "in-progress";
  startDate?: string;
  imageUrl: string;
  lastLessonId?: string;
  lastLessonTitle?: string;
};

/**
 * Adjunta la cookie de sesión (guardada por el cliente expo en SecureStore) para
 * llamar a endpoints autenticados de la API de Cursumi.
 */
function authHeaders(): Record<string, string> {
  const cookie = authClient.getCookie();
  return cookie ? { Cookie: cookie } : {};
}

/** Cursos en los que el usuario está inscrito. */
export async function getMyCourses(): Promise<StudentCourse[]> {
  const res = await fetch(`${API_URL}/api/me/courses`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  return (Array.isArray(data) ? data : []) as StudentCourse[];
}

export type CourseLesson = {
  id: string;
  title: string;
  type?: string;
};

export type CourseSection = {
  id: string;
  title: string;
  lessons: CourseLesson[];
};

export type CourseDetail = {
  progress: number;
  course: {
    title: string;
    description?: string | null;
    instructor?: { name?: string | null } | null;
    sections: CourseSection[];
  };
  lessonProgress: { lessonId: string }[];
};

/** Detalle (temario + progreso) de un curso inscrito. */
export async function getMyCourseDetail(courseId: string): Promise<CourseDetail> {
  const res = await fetch(`${API_URL}/api/me/courses/${courseId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as CourseDetail;
}
