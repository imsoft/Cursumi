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
