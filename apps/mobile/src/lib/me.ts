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

export type Lesson = {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  type: string;
  duration?: string | null;
  videoUrl?: string | null;
  content?: string | null;
  completed: boolean;
};

/** Contenido de una lección (verifica inscripción en el servidor). */
export async function getLesson(lessonId: string): Promise<Lesson> {
  const res = await fetch(`${API_URL}/api/me/lessons/${lessonId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Lesson;
}

/** Marca una lección como completada (opcionalmente con puntaje de quiz). */
export async function completeLesson(
  lessonId: string,
  courseId: string,
  extra?: { score?: number; answers?: Record<string, number | number[]> }
): Promise<void> {
  const res = await fetch(`${API_URL}/api/lessons/${lessonId}/complete`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ courseId, ...extra }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

/** Respuesta de tarea (assignment) ya enviada, si existe. */
export async function getAssignment(
  lessonId: string,
  courseId: string
): Promise<{ content: string; submittedAt: string } | null> {
  const res = await fetch(
    `${API_URL}/api/lessons/${lessonId}/assignment?courseId=${encodeURIComponent(courseId)}`,
    { headers: authHeaders() }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.submission ?? null;
}

/** Envía/actualiza la respuesta de una tarea. */
export async function submitAssignment(
  lessonId: string,
  courseId: string,
  content: string
): Promise<void> {
  const res = await fetch(`${API_URL}/api/lessons/${lessonId}/assignment`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ courseId, content }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

/** Pregunta de quiz (parseada de lesson.content). */
export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer?: number;
  correctAnswers?: number[];
  type?: "multiple-choice" | "true-false" | "checkbox";
};

export type QuizConfig = {
  /** Límite de tiempo en minutos (0 = sin límite). */
  timeLimitMin: number;
  /** Máximo de intentos (0 = ilimitados). */
  maxAttempts: number;
  /** Puntaje mínimo para aprobar (0–100). */
  passingScore: number;
};

/** Parsea la configuración del quiz (tiempo, intentos, puntaje de aprobación). */
export function parseQuizConfig(content: string | null | undefined): QuizConfig {
  const fallback: QuizConfig = { timeLimitMin: 0, maxAttempts: 0, passingScore: 70 };
  if (!content) return fallback;
  try {
    const p = JSON.parse(content);
    if (p && typeof p === "object" && !Array.isArray(p)) {
      return {
        timeLimitMin: Number(p.timeLimit) || 0,
        maxAttempts: Number(p.attempts) || 0,
        passingScore: Number(p.passingScore) || 70,
      };
    }
  } catch {}
  return fallback;
}

/** Parsea las preguntas del quiz desde el JSON de lesson.content. */
export function parseQuizQuestions(content: string | null | undefined): QuizQuestion[] {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    const list = Array.isArray(parsed) ? parsed : parsed?.questions;
    if (!Array.isArray(list)) return [];
    return list.map((q: Record<string, unknown>) => ({
      question: String(q.question ?? ""),
      options: Array.isArray(q.options) ? (q.options as string[]) : [],
      correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : undefined,
      correctAnswers: Array.isArray(q.correctAnswers) ? (q.correctAnswers as number[]) : undefined,
      type: (q.type as QuizQuestion["type"]) ?? "multiple-choice",
    }));
  } catch {
    return [];
  }
}

export type Certificate = {
  id: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  issueDate: string;
  certificateNumber: string;
  category?: { name?: string } | string | null;
  hours?: number;
  imageUrl?: string | null;
};

/** Certificados obtenidos por el usuario. */
export async function getCertificates(): Promise<Certificate[]> {
  const res = await fetch(`${API_URL}/api/me/certificates`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  return (Array.isArray(data) ? data : []) as Certificate[];
}

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  link?: string | null;
  createdAt: string;
};

/** Notificaciones del usuario + conteo de no leídas. */
export async function getNotifications(): Promise<{
  notifications: Notification[];
  unreadCount: number;
}> {
  const res = await fetch(`${API_URL}/api/notifications`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return {
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
    unreadCount: data.unreadCount ?? 0,
  };
}

/** Marca una notificación como leída. */
export async function markNotificationRead(id: string): Promise<void> {
  await fetch(`${API_URL}/api/notifications/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(),
  });
}

/** Marca todas las notificaciones como leídas. */
export async function markAllNotificationsRead(): Promise<void> {
  await fetch(`${API_URL}/api/notifications/read-all`, {
    method: "PATCH",
    headers: authHeaders(),
  });
}

/** IDs de cursos en la lista de deseos del usuario. */
export async function getWishlist(): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/wishlist`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  return (Array.isArray(data) ? data : []) as string[];
}

/** Agrega/quita un curso de la lista de deseos (toggle). Devuelve si quedó guardado. */
export async function toggleWishlist(courseId: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/wishlist`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ courseId }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Boolean(data.saved);
}

export type ExamQuestion = {
  id: string;
  question: string;
  type?: string;
  options?: string[];
  points?: number;
};

export type Exam = {
  id: string;
  passingScore: number;
  timeLimit?: number;
  questions: ExamQuestion[];
};

/** Examen final del curso (sin respuestas). 404 si el curso no tiene examen. */
export async function getExam(courseId: string): Promise<Exam | null> {
  const res = await fetch(`${API_URL}/api/courses/${courseId}/exam`, {
    headers: authHeaders(),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Exam;
}

export type ExamResult = {
  score: number;
  passed: boolean;
  certificate: { id: string; number: string } | null;
};

/** Envía el examen final. answers = { [questionId]: índice de opción }. */
export async function submitExam(
  courseId: string,
  answers: Record<string, number>
): Promise<ExamResult> {
  const res = await fetch(`${API_URL}/api/courses/${courseId}/exam/submit`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  return (await res.json()) as ExamResult;
}

export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: { name?: string | null };
};

/** Reseñas de un curso + promedio. */
export async function getReviews(
  courseId: string
): Promise<{ reviews: Review[]; average: number; total: number }> {
  const res = await fetch(`${API_URL}/api/courses/${courseId}/reviews`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return {
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
    average: data.average ?? 0,
    total: data.total ?? 0,
  };
}

/** Crea/actualiza la reseña del usuario para un curso (requiere inscripción). */
export async function postReview(
  courseId: string,
  rating: number,
  comment?: string
): Promise<void> {
  const res = await fetch(`${API_URL}/api/courses/${courseId}/reviews`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ rating, comment }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
}

export type Referral = {
  referralCode: string | null;
  referralLink: string;
  totalReferrals: number;
  pendingReferrals: number;
  earnedReferrals: number;
  totalEarnedCents: number;
  totalPaidCents: number;
};

/** Datos del programa de referidos del usuario (código, link, stats). */
export async function getReferral(): Promise<Referral> {
  const res = await fetch(`${API_URL}/api/me/referral`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Referral;
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
