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

export type SectionQuizQuestion = {
  question: string;
  options: string[];
  correct: number;
};

export type Lesson = {
  id: string;
  courseId: string;
  sectionId?: string;
  title: string;
  description?: string | null;
  type: string;
  duration?: string | null;
  videoUrl?: string | null;
  content?: string | null;
  sectionQuiz?: unknown; // Json: array u objeto { questions: [...] }
  sectionMinigame?: unknown; // Json: { type, ... }
  completed: boolean;
};

// Minijuegos de sección
export type Minigame =
  | { type: "memory"; instruction?: string; pairs: { term: string; definition: string }[] }
  | { type: "hangman"; instruction?: string; words: { word: string; hint: string }[] }
  | { type: "sort"; instruction: string; items: string[] }
  | { type: "match"; instruction: string; pairs: { left: string; right: string }[] };

/** Normaliza el Json del minijuego de sección a su tipo. */
export function parseMinigame(raw: unknown): Minigame | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Minigame;
  if (m.type === "memory" || m.type === "hangman" || m.type === "sort" || m.type === "match") {
    return m;
  }
  return null;
}

/** Marca un minijuego de sección como completado. */
export async function completeSectionMinigame(
  sectionId: string,
  courseId: string
): Promise<void> {
  await fetch(`${API_URL}/api/sections/${sectionId}/minigame/complete`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ courseId, activityId: "default" }),
  });
}

/** Normaliza el quiz de sección (Json) a una lista de preguntas. */
export function parseSectionQuiz(raw: unknown): SectionQuizQuestion[] {
  const list = Array.isArray(raw)
    ? raw
    : (raw as { questions?: unknown })?.questions;
  if (!Array.isArray(list)) return [];
  return list
    .map((q: Record<string, unknown>) => ({
      question: String(q.question ?? ""),
      options: Array.isArray(q.options) ? (q.options as string[]) : [],
      correct: typeof q.correct === "number" ? q.correct : 0,
    }))
    .filter((q) => q.options.length > 0);
}

/** Envía el quiz de una sección. answers = { [índice]: opción elegida }. */
export async function submitSectionQuiz(
  sectionId: string,
  courseId: string,
  answers: Record<string, number>
): Promise<{ score: number; passed: boolean }> {
  const res = await fetch(`${API_URL}/api/sections/${sectionId}/quiz/submit`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ courseId, activityId: "default", answers }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  const data = await res.json();
  return { score: data.score ?? 0, passed: Boolean(data.passed) };
}

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

export type Note = {
  id: string;
  content: string;
  createdAt: string;
  courseId?: string;
  lessonId?: string | null;
  course?: { id: string; title: string } | null;
  lesson?: { id: string; title: string } | null;
};

/** Notas del usuario (opcionalmente filtradas por curso/lección). */
export async function getNotes(filter?: {
  courseId?: string;
  lessonId?: string;
}): Promise<Note[]> {
  const qs = new URLSearchParams();
  if (filter?.courseId) qs.set("courseId", filter.courseId);
  if (filter?.lessonId) qs.set("lessonId", filter.lessonId);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await fetch(`${API_URL}/api/notes${suffix}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  return (Array.isArray(data) ? data : []) as Note[];
}

/** Crea una nota (en un curso y, opcionalmente, una lección). */
export async function createNote(
  courseId: string,
  content: string,
  lessonId?: string
): Promise<Note> {
  const res = await fetch(`${API_URL}/api/notes`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ courseId, lessonId, content }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Note;
}

/** Elimina una nota. */
export async function deleteNote(noteId: string): Promise<void> {
  await fetch(`${API_URL}/api/notes/${noteId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export type ChatMessage = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
  sender?: { name?: string | null };
};

/** Obtiene (o crea) la conversación del curso con su instructor, con mensajes. */
export async function getConversation(
  courseId: string
): Promise<{ id: string; messages: ChatMessage[] }> {
  const res = await fetch(`${API_URL}/api/conversations?courseId=${encodeURIComponent(courseId)}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return { id: data.id, messages: Array.isArray(data.messages) ? data.messages : [] };
}

/** Mensajes de una conversación. */
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  return (Array.isArray(data) ? data : []) as ChatMessage[];
}

/** Envía un mensaje a la conversación. */
export async function sendMessage(conversationId: string, body: string): Promise<ChatMessage> {
  const res = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as ChatMessage;
}

/** Marca la conversación como leída. */
export async function markConversationRead(conversationId: string): Promise<void> {
  await fetch(`${API_URL}/api/conversations/${conversationId}/read`, {
    method: "PATCH",
    headers: authHeaders(),
  });
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
  role: string;
  coursesCompleted: number;
  coursesInProgress: number;
};

// ─── Instructor ───────────────────────────────────────────────────────────────
export type InstructorEarnings = {
  total: number;
  thisMonth?: number;
  courses?: number;
  monthly?: { month: string; amount: number }[];
};

export type InstructorAnalytics = {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  avgProgress: number;
  earnings?: number;
};

export type InstructorConversation = {
  id: string;
  student?: { name?: string | null };
  course?: { title?: string | null };
  messages?: { body: string; createdAt: string; read: boolean; senderId: string }[];
};

export async function getInstructorEarnings(): Promise<InstructorEarnings> {
  const res = await fetch(`${API_URL}/api/instructor/earnings`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as InstructorEarnings;
}

export async function getInstructorAnalytics(): Promise<InstructorAnalytics> {
  const res = await fetch(`${API_URL}/api/instructor/analytics`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as InstructorAnalytics;
}

export type InstructorProfile = {
  fullName: string;
  email: string;
  headline: string;
  bio: string;
  specialties: string;
  teachingYears: number | null;
  state: string;
  city: string;
  website: string;
  linkedinUrl: string;
  instagramUrl: string;
  avatar: string | null;
};

export async function getInstructorProfile(): Promise<InstructorProfile> {
  const res = await fetch(`${API_URL}/api/instructor/profile`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as InstructorProfile;
}

export async function updateInstructorProfile(data: {
  headline?: string;
  bio?: string;
  specialties?: string;
  teachingYears?: number;
  website?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
}): Promise<void> {
  const res = await fetch(`${API_URL}/api/instructor/profile`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
}

/** Estado de Stripe Connect del instructor (cobros). */
export async function getStripeStatus(): Promise<{ connected: boolean; onboarded: boolean }> {
  const res = await fetch(`${API_URL}/api/instructor/stripe/connect`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return { connected: Boolean(data.connected), onboarded: Boolean(data.onboarded) };
}

/** Inicia/continúa el onboarding de Stripe Connect; devuelve la URL a abrir. */
export async function startStripeConnect(): Promise<string> {
  const res = await fetch(`${API_URL}/api/instructor/stripe/connect`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error ?? "No se pudo conectar con Stripe.");
  return data.url as string;
}

export type InstructorCourse = {
  id: string;
  title: string;
  modality?: string;
  status: string; // draft | published | archived
  price?: number;
  imageUrl?: string | null;
  studentsCount?: number;
};

/** Cursos del instructor. */
export async function getInstructorCourses(): Promise<InstructorCourse[]> {
  const res = await fetch(`${API_URL}/api/instructor/courses`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  return (Array.isArray(data) ? data : []) as InstructorCourse[];
}

/** Cambia el estado de un curso (publicar/despublicar/archivar). */
export async function setCourseStatus(
  courseId: string,
  status: "draft" | "published" | "archived"
): Promise<void> {
  const res = await fetch(`${API_URL}/api/instructor/courses/${courseId}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `No se pudo actualizar (HTTP ${res.status}).`);
  }
}

export async function getInstructorConversations(): Promise<InstructorConversation[]> {
  const res = await fetch(`${API_URL}/api/instructor/conversations`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  return (Array.isArray(data) ? data : []) as InstructorConversation[];
}

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
  website?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
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

// ─── Blog ───────────────────────────────────────────────────────────────────
export type BlogPostSummary = {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  publishedAt?: string | null;
};

export type BlogPost = BlogPostSummary & {
  content: string;
  author?: { name?: string | null; image?: string | null } | null;
};

/** Artículos publicados del blog. */
export async function getBlogPosts(): Promise<BlogPostSummary[]> {
  const res = await fetch(`${API_URL}/api/blog`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  const list = Array.isArray(data)
    ? data
    : ((data as { posts?: unknown }).posts ?? []);
  return (Array.isArray(list) ? list : []) as BlogPostSummary[];
}

/** Artículo completo por slug. */
export async function getBlogPost(slug: string): Promise<BlogPost> {
  const res = await fetch(`${API_URL}/api/blog/${slug}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as BlogPost;
}

// ─── Juegos (Kahoot-style, lado jugador) ────────────────────────────────────
export type GameParticipant = {
  id: string;
  nickname: string;
  score: number;
  userId: string;
};

export type GameQuestion = {
  id: string;
  question: string;
  options: string[];
  order: number;
  timeLimitSec?: number;
};

export type GameState = {
  game: {
    id: string;
    status: string; // waiting | active | finished
    currentQuestion: number;
    title?: string;
    code?: string;
    questions: GameQuestion[];
  };
  currentQ: GameQuestion | null;
  participants: GameParticipant[];
  myAnswer: { selectedOption?: number } | null;
  myParticipantId: string | null;
  myNickname: string | null;
};

/** Une al usuario a un juego con código + nickname. Devuelve el gameId. */
export async function joinGame(code: string, nickname: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/games/join`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ code: code.toUpperCase().trim(), nickname: nickname.trim() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data.gameId as string;
}

/** Estado actual del juego para el jugador. */
export async function getGame(gameId: string): Promise<GameState> {
  const res = await fetch(`${API_URL}/api/games/${gameId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as GameState;
}

/** Envía la respuesta del jugador a la pregunta actual. */
export async function answerGame(
  gameId: string,
  questionId: string,
  selectedOption: number
): Promise<void> {
  await fetch(`${API_URL}/api/games/${gameId}/answer`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ questionId, selectedOption }),
  });
}

// ─── Empresas (solicitud pública de cotización) ─────────────────────────────
export async function submitQuoteRequest(data: {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  companySize?: string | null;
  interests?: string | null;
  message?: string | null;
}): Promise<void> {
  const res = await fetch(`${API_URL}/api/business/quote-requests`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export type AdminStats = {
  totalUsers: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  estimatedRevenue: number;
};
export async function getAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${API_URL}/api/admin/stats`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as AdminStats;
}

export type AdminAnalytics = {
  revenueByMonth: { month: string; amount: number }[];
  usersByMonth: { month: string; users: number }[];
};
export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const res = await fetch(`${API_URL}/api/admin/analytics`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const d = await res.json();
  return {
    revenueByMonth: Array.isArray(d.revenueByMonth) ? d.revenueByMonth : [],
    usersByMonth: Array.isArray(d.usersByMonth) ? d.usersByMonth : [],
  };
}

export type AdminFinances = {
  totalRevenue?: number;
  totalPlatformFee?: number;
  totalInstructorPayouts?: number;
  thisMonthRevenue?: number;
};
export async function getAdminFinances(): Promise<AdminFinances> {
  const res = await fetch(`${API_URL}/api/admin/finances`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as AdminFinances;
}

export type AdminReview = {
  id: string;
  rating: number;
  comment?: string | null;
  approved: boolean;
  user?: { name?: string | null };
  course?: { title?: string | null };
};
export async function getAdminReviews(approved = false): Promise<AdminReview[]> {
  const res = await fetch(`${API_URL}/api/admin/reviews?approved=${approved}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const d: unknown = await res.json();
  const list = Array.isArray(d) ? d : (d as { reviews?: unknown }).reviews;
  return (Array.isArray(list) ? list : []) as AdminReview[];
}
export async function setReviewApproved(id: string, approved: boolean): Promise<void> {
  await fetch(`${API_URL}/api/admin/reviews/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ approved }),
  });
}
export async function deleteReview(id: string): Promise<void> {
  await fetch(`${API_URL}/api/admin/reviews/${id}`, { method: "DELETE", headers: authHeaders() });
}

export type AdminApplication = {
  id: string;
  status: string;
  headline?: string | null;
  bio?: string | null;
  reason?: string | null;
  createdAt: string;
  user?: { id: string; name?: string | null; email?: string | null };
};

export async function getInstructorApplications(): Promise<AdminApplication[]> {
  const res = await fetch(`${API_URL}/api/admin/instructor-applications?status=pending`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.applications) ? data.applications : [];
}

export async function reviewApplication(
  id: string,
  action: "approve" | "reject",
  rejectionReason?: string
): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/instructor-applications/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(action === "approve" ? { action } : { action, rejectionReason }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
}

export type AdminUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  emailVerified?: boolean;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch(`${API_URL}/api/admin/users`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  const list = Array.isArray(data) ? data : (data as { users?: unknown }).users;
  return (Array.isArray(list) ? list : []) as AdminUser[];
}

export async function setUserRole(
  userId: string,
  role: "student" | "instructor" | "admin"
): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
}

export type QuoteRequest = {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  companySize?: string | null;
  interests?: string | null;
  message?: string | null;
  status: string;
  createdAt: string;
};

export async function getQuoteRequests(): Promise<QuoteRequest[]> {
  const res = await fetch(`${API_URL}/api/admin/business/quote-requests`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.requests) ? data.requests : [];
}

export async function updateQuoteRequest(
  id: string,
  status: "new" | "contacted" | "converted" | "closed"
): Promise<void> {
  await fetch(`${API_URL}/api/admin/business/quote-requests`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
}

// ─── Crear curso (instructor) ────────────────────────────────────────────────
export async function getCategories(): Promise<{ name: string; slug: string }[]> {
  const res = await fetch(`${API_URL}/api/categories`, { headers: authHeaders() });
  if (!res.ok) return [];
  const data: unknown = await res.json();
  return (Array.isArray(data) ? data : []) as { name: string; slug: string }[];
}

export type NewLesson = {
  id: string;
  title: string;
  type: "video" | "text";
  order: number;
  content?: string;
  videoUrl?: string;
};
export type NewSection = { id: string; title: string; order: number; lessons: NewLesson[] };
export type NewCoursePayload = {
  title: string;
  description: string;
  category: string;
  level: string;
  modality: "virtual" | "presencial" | "live";
  price: number;
  imageUrl?: string;
  sections: NewSection[];
  isDraft: boolean;
};

/** Crea un curso (borrador por defecto). Devuelve el curso creado. */
export async function createInstructorCourse(payload: NewCoursePayload): Promise<{ id: string }> {
  const res = await fetch(`${API_URL}/api/instructor/courses`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as { id: string };
}

/** Pide a Mux una URL de subida directa para un video. */
export async function requestMuxUpload(
  lessonTitle: string
): Promise<{ uploadId: string; uploadUrl: string }> {
  const res = await fetch(`${API_URL}/api/mux/upload-url`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ lessonTitle }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as { uploadId: string; uploadUrl: string };
}

/** Sube el archivo de video a la URL de Mux (PUT directo). */
export async function uploadVideoToMux(uploadUrl: string, uri: string): Promise<void> {
  const file = await fetch(uri);
  const blob = await file.blob();
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "video/mp4" },
    body: blob,
  });
  if (!res.ok && res.status !== 200) throw new Error(`Subida falló (HTTP ${res.status})`);
}

/** Consulta el playback de Mux (puede tardar; reintentar). */
export async function getMuxPlayback(
  uploadId: string
): Promise<{ playbackId?: string; playbackUrl?: string }> {
  const res = await fetch(`${API_URL}/api/mux/playback/${uploadId}`, { headers: authHeaders() });
  if (!res.ok) return {};
  return (await res.json()) as { playbackId?: string; playbackUrl?: string };
}

// ─── Juegos (lado anfitrión / instructor) ───────────────────────────────────
export type HostGame = {
  id: string;
  title: string;
  code: string;
  status: string;
  _count?: { participants: number; questions: number };
};

export type NewGameQuestion = { question: string; options: string[]; correct: number };

/** Lista los juegos creados por el instructor. */
export async function listMyGames(): Promise<HostGame[]> {
  const res = await fetch(`${API_URL}/api/games`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.games) ? data.games : [];
}

/** Crea un juego con preguntas. Devuelve el gameId. */
export async function createGame(title: string, questions: NewGameQuestion[]): Promise<string> {
  const res = await fetch(`${API_URL}/api/games`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ title, questions }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data.game?.id as string;
}

export async function startGame(id: string): Promise<void> {
  await fetch(`${API_URL}/api/games/${id}/start`, { method: "POST", headers: authHeaders() });
}
export async function nextGameQuestion(id: string): Promise<void> {
  await fetch(`${API_URL}/api/games/${id}/next`, { method: "POST", headers: authHeaders() });
}
export async function finishGame(id: string): Promise<void> {
  await fetch(`${API_URL}/api/games/${id}/finish`, { method: "POST", headers: authHeaders() });
}

// ─── Materiales de empresa ──────────────────────────────────────────────────
export type OrgMaterial = {
  id: string;
  name: string;
  description?: string | null;
  fileUrl: string;
  fileType: string;
  createdAt: string;
};

/** Materiales internos de la organización del usuario. */
export async function getOrgMaterials(): Promise<{
  orgName: string | null;
  materials: OrgMaterial[];
}> {
  const res = await fetch(`${API_URL}/api/me/org-materials`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return {
    orgName: data.orgName ?? null,
    materials: Array.isArray(data.materials) ? data.materials : [],
  };
}

// ─── Avatar ─────────────────────────────────────────────────────────────────
/** Sube una imagen de perfil (multipart). `uri` es la ruta local del selector. */
export async function uploadAvatar(uri: string): Promise<void> {
  const form = new FormData();
  const name = uri.split("/").pop() || "avatar.jpg";
  const ext = name.split(".").pop()?.toLowerCase() || "jpg";
  const type = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  // React Native: el archivo se adjunta como { uri, name, type }.
  form.append("file", { uri, name, type } as unknown as Blob);
  const res = await fetch(`${API_URL}/api/me/avatar`, {
    method: "POST",
    headers: authHeaders(), // sin Content-Type: lo fija FormData con el boundary
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
}

// ─── Volverse instructor ────────────────────────────────────────────────────
/** Envía la solicitud para volverse instructor. */
export async function applyInstructor(data: {
  headline: string;
  bio: string;
  reason: string;
}): Promise<void> {
  const res = await fetch(`${API_URL}/api/instructor/apply`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
}

// ─── Reflexiones de aprendizaje (qué aprendiste) ────────────────────────────
export type Reflection = {
  id: string;
  content: string;
  user?: { name?: string | null };
};

/** Reflexiones de aprendizaje de un curso. */
export async function getReflections(courseId: string): Promise<Reflection[]> {
  const res = await fetch(`${API_URL}/api/courses/${courseId}/learning-reflections`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.reflections) ? data.reflections : [];
}

/** Crea/actualiza la reflexión del usuario para un curso. */
export async function postReflection(courseId: string, content: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/courses/${courseId}/learning-reflections`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
}
