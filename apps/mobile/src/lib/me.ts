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

export type MyProfile = {
  fullName: string;
  email: string;
  joinDate: string;
  avatar: string | null;
  phone: string;
  state: string;
  city: string;
  bio: string;
  website: string;
  linkedinUrl: string;
  instagramUrl: string;
  coursesCompleted: number;
  coursesInProgress: number;
};

/** Perfil del usuario + estadísticas de cursos. */
export async function getMyProfile(): Promise<MyProfile> {
  const res = await fetch(`${API_URL}/api/me/profile`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as MyProfile;
}

/** Actualiza campos editables del perfil. */
export async function updateMyProfile(data: {
  fullName?: string;
  phone?: string | null;
  state?: string | null;
  city?: string | null;
  bio?: string | null;
}): Promise<void> {
  const res = await fetch(`${API_URL}/api/me/profile`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
}
