/**
 * Prefill compartido para los documentos de planeación: datos del curso que se
 * reutilizan para no reescribirlos a mano en cada documento.
 * Módulo puro (sin dependencias de servidor) — importable desde cliente y servidor.
 */

export type PlanningPrefillLesson = {
  title: string;
  /** Etiqueta de duración tal cual del curso, p. ej. "15 min" */
  durationLabel: string;
};

export type PlanningPrefillUnit = {
  title: string;
  lessons: PlanningPrefillLesson[];
};

export type PlanningPrefillQuestion = {
  statement: string;
  options: string[];
  /** Índice de la opción correcta (para hoja de respuestas), o null si se desconoce */
  correctIndex: number | null;
};

export type PlanningPrefill = {
  courseName: string;
  instructorName: string;
  /** Duración total del curso (formateada) */
  duration: string;
  /** Descripción del curso en texto plano (sin HTML) */
  description: string;
  /** Sede/ubicación (curso o primera sesión) */
  location: string;
  /** Fechas legibles (sesiones o fecha de inicio) */
  dates: string;
  /** Horario "HH:mm–HH:mm" de la primera sesión, si aplica */
  schedule: string;
  /** Fecha de inicio en ISO "YYYY-MM-DD" (curso o primera sesión) */
  startDate: string;
  /** Cupo máximo como texto */
  participantCount: string;
  level: string;
  category: string;
  modality: string;
  /** Estructura del curso: secciones → lecciones */
  units: PlanningPrefillUnit[];
  /** Preguntas del examen final y de los quizzes por sección (para evaluaciones) */
  questions: PlanningPrefillQuestion[];
};

/** Convierte HTML a texto plano razonable para precargar campos de texto. */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Preguntas del curso → prefill de evaluaciones ──────────────────────────

/** Normaliza una pregunta del examen final del curso (formato CourseFinalExam). */
function normalizeExamQuestion(q: Record<string, unknown>): PlanningPrefillQuestion {
  const type = typeof q.type === "string" ? q.type : "multiple-choice";
  const options = Array.isArray(q.options)
    ? (q.options as unknown[]).map((o) => String(o))
    : type === "true-false"
      ? ["Verdadero", "Falso"]
      : [];

  let correctIndex: number | null = null;
  const ca = q.correctAnswer;
  if (typeof ca === "number") {
    correctIndex = ca;
  } else if (typeof ca === "string") {
    const byOption = options.indexOf(ca);
    if (byOption >= 0) correctIndex = byOption;
    else if (type === "true-false") {
      const v = ca.toLowerCase();
      correctIndex = v === "true" || v === "verdadero" ? 0 : v === "false" || v === "falso" ? 1 : null;
    }
  }

  return { statement: typeof q.question === "string" ? q.question : "", options, correctIndex };
}

/**
 * Extrae las preguntas reutilizables del curso: examen final + quizzes por sección.
 * Recibe los JSON crudos (Prisma `Json`) y devuelve una lista normalizada.
 */
export function extractPrefillQuestions(
  finalExam: unknown,
  sectionQuizzes: unknown[],
): PlanningPrefillQuestion[] {
  const out: PlanningPrefillQuestion[] = [];

  const feQuestions = (finalExam as { questions?: unknown } | null)?.questions;
  if (Array.isArray(feQuestions)) {
    for (const q of feQuestions) {
      if (q && typeof q === "object") out.push(normalizeExamQuestion(q as Record<string, unknown>));
    }
  }

  for (const quiz of sectionQuizzes) {
    const qs = (quiz as { questions?: unknown } | null)?.questions;
    if (!Array.isArray(qs)) continue;
    for (const q of qs) {
      if (!q || typeof q !== "object") continue;
      const qq = q as Record<string, unknown>;
      out.push({
        statement: typeof qq.question === "string" ? qq.question : "",
        options: Array.isArray(qq.options) ? (qq.options as unknown[]).map((o) => String(o)) : [],
        correctIndex: typeof qq.correct === "number" ? qq.correct : null,
      });
    }
  }

  return out.filter((q) => q.statement.trim() !== "");
}

// ─── Merge no destructivo (para "Traer datos del curso") ────────────────────

/** ¿El valor está "vacío"? Ignora `id` en objetos; trata "" y 0 como vacío. */
export function isDeepEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "number") return value === 0;
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return value.every(isDeepEmpty);
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).every(
      ([k, v]) => k === "id" || isDeepEmpty(v),
    );
  }
  return false;
}

/**
 * Rellena en `current` únicamente los campos vacíos usando `seed` (datos del curso).
 * No sobrescribe lo que el instructor ya escribió. Los arrays solo se reemplazan
 * completos cuando `current` no tiene ninguna fila con contenido.
 */
export function deepFillEmpty<T>(current: T, seed: T): T {
  if (Array.isArray(current) && Array.isArray(seed)) {
    return (current.every(isDeepEmpty) ? seed : current) as T;
  }
  if (
    current &&
    seed &&
    typeof current === "object" &&
    typeof seed === "object" &&
    !Array.isArray(current)
  ) {
    const out: Record<string, unknown> = { ...(current as Record<string, unknown>) };
    const seedObj = seed as Record<string, unknown>;
    for (const key of Object.keys(seedObj)) {
      if (key === "id") continue;
      out[key] = deepFillEmpty((current as Record<string, unknown>)[key], seedObj[key]);
    }
    return out as T;
  }
  return (isDeepEmpty(current) ? seed : current) as T;
}
