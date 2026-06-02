/**
 * course-completion.ts
 * Lógica centralizada de completitud y publicabilidad para cursos y clases.
 * Funciones puras — sin efectos secundarios ni dependencias de UI.
 */

import { parseDurationToMinutes } from "@/lib/utils";
import type { CourseFormData, CourseLesson, CourseSection } from "@/components/instructor/course-types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CompletionItem = {
  key: string;
  label: string;
  fulfilled: boolean;
  /** Mensaje accionable mostrado cuando NO está cumplido */
  message: string;
};

export type StatusTone = "error" | "warning" | "success";

export type LessonCompletion = {
  percentage: number;        // 0–100
  required: CompletionItem[];
  recommended: CompletionItem[];
  canPublish: boolean;       // todos los requeridos cumplidos
  statusLabel: string;
  statusTone: StatusTone;
  actionMessage: string;     // el mensaje más relevante para mostrar al instructor
};

export type CourseStats = {
  totalSections: number;
  totalLessons: number;
  lessonsReady: number;
  lessonsIncomplete: number;
  totalDurationMinutes: number;
  totalDurationFormatted: string;
};

export type CourseCompletion = {
  percentage: number;
  required: CompletionItem[];
  recommended: CompletionItem[];
  canPublish: boolean;
  statusLabel: string;
  statusTone: StatusTone;
  actionMessage: string;
  stats: CourseStats;
};

// ─── Weights ──────────────────────────────────────────────────────────────────

// 60% del score viene de requeridos, 40% de recomendados
const REQUIRED_WEIGHT = 60;
const RECOMMENDED_WEIGHT = 40;

function calcPercentage(
  required: CompletionItem[],
  recommended: CompletionItem[],
): number {
  const reqCount = required.length;
  const recCount = recommended.length;

  const reqScore =
    reqCount > 0
      ? (required.filter((r) => r.fulfilled).length / reqCount) * REQUIRED_WEIGHT
      : REQUIRED_WEIGHT; // si no hay requeridos, full peso

  const recScore =
    recCount > 0
      ? (recommended.filter((r) => r.fulfilled).length / recCount) * RECOMMENDED_WEIGHT
      : 0;

  return Math.round(reqScore + recScore);
}

function deriveLessonTone(canPublish: boolean, percentage: number): StatusTone {
  if (!canPublish) return "error";
  if (percentage < 75) return "warning";
  return "success";
}

function deriveLessonLabel(canPublish: boolean, percentage: number): string {
  if (!canPublish) return "Incompleta";
  if (percentage < 75) return "Casi lista";
  return "Lista";
}

function deriveCourseTone(canPublish: boolean, percentage: number): StatusTone {
  if (!canPublish) return "error";
  if (percentage < 75) return "warning";
  return "success";
}

function deriveCourseLabel(canPublish: boolean, percentage: number): string {
  if (!canPublish) return "Borrador incompleto";
  if (percentage < 75) return "Listo para publicar";
  return "Curso completo";
}

// ─── Lesson completion ────────────────────────────────────────────────────────

/**
 * Calcula el estado de completitud de una clase individual.
 * Requeridos varían según el tipo de lección.
 */
export function getLessonCompletion(lesson: CourseLesson): LessonCompletion {
  const isVideo = lesson.type === "video";
  const isText = lesson.type === "text";
  const isQuiz = lesson.type === "quiz";

  const hasTitle = Boolean(lesson.title?.trim());
  const hasVideo = Boolean(lesson.videoUrl?.trim());
  const hasContent = Boolean(lesson.content?.trim());
  const hasQuestions =
    Array.isArray(lesson.quizQuestions) && lesson.quizQuestions.length > 0;
  const hasDescription = Boolean(lesson.description?.trim());
  const hasFiles =
    (Array.isArray(lesson.files) && lesson.files.length > 0) ||
    (Array.isArray(lesson.resources) && lesson.resources.length > 0);

  // ── Required ──────────────────────────────────────────────────────────────
  const required: CompletionItem[] = [
    {
      key: "title",
      label: "Título",
      fulfilled: hasTitle,
      message: "Agrega un título a esta clase",
    },
  ];

  if (isVideo) {
    required.push({
      key: "video",
      label: "Video",
      fulfilled: hasVideo,
      message: "Sube el video para completar esta clase",
    });
  } else if (isText) {
    required.push({
      key: "content",
      label: "Contenido",
      fulfilled: hasContent,
      message: "Agrega el contenido de texto para esta clase",
    });
  } else if (isQuiz) {
    required.push({
      key: "questions",
      label: "Preguntas",
      fulfilled: hasQuestions,
      message: "Agrega al menos una pregunta al quiz",
    });
  }
  // assignment: solo título como requerido

  // ── Recommended ───────────────────────────────────────────────────────────
  const recommended: CompletionItem[] = [
    {
      key: "description",
      label: "Descripción",
      fulfilled: hasDescription,
      message: "Agrega una descripción para mejorar la experiencia del alumno",
    },
    {
      key: "resources",
      label: "Recursos o archivos",
      fulfilled: hasFiles,
      message: "Adjunta recursos o archivos de apoyo",
    },
  ];

  const canPublish = required.every((r) => r.fulfilled);
  const percentage = calcPercentage(required, recommended);
  const statusTone = deriveLessonTone(canPublish, percentage);
  const statusLabel = deriveLessonLabel(canPublish, percentage);

  // Mensaje principal: el primer requerido faltante, o el primer recomendado faltante
  const firstMissingRequired = required.find((r) => !r.fulfilled);
  const firstMissingRecommended = recommended.find((r) => !r.fulfilled);
  const actionMessage = firstMissingRequired
    ? firstMissingRequired.message
    : firstMissingRecommended
      ? firstMissingRecommended.message
      : "Esta clase cumple todos los requisitos";

  return {
    percentage,
    required,
    recommended,
    canPublish,
    statusLabel,
    statusTone,
    actionMessage,
  };
}

// ─── Duration ─────────────────────────────────────────────────────────────────

/**
 * Suma la duración total de todas las lecciones de un curso en minutos.
 * Ignora lecciones sin duración.
 */
export function getCourseDuration(sections: CourseSection[]): number {
  return sections.reduce((total, section) => {
    const sectionMinutes = section.lessons.reduce((acc, lesson) => {
      return acc + parseDurationToMinutes(lesson.duration);
    }, 0);
    return total + sectionMinutes;
  }, 0);
}

// ─── Course completion ────────────────────────────────────────────────────────

/**
 * Calcula el estado de completitud general de un curso.
 */
export function getCourseCompletion(courseData: CourseFormData): CourseCompletion {
  const sections = courseData.sections ?? [];
  const allLessons = sections.flatMap((s) => s.lessons);

  const hasTitle = Boolean(courseData.title?.trim());
  const hasThumbnail = Boolean(courseData.imageUrl?.trim());
  const hasSections = sections.length > 0;

  const hasDescription = Boolean(courseData.description?.trim());
  const hasCategory = Boolean(courseData.category?.trim());
  const hasLevel = Boolean(courseData.level?.trim());
  const hasPrice = typeof courseData.price === "number" && courseData.price > 0;
  const hasVideoLesson = allLessons.some(
    (l) => l.type === "video" && Boolean(l.videoUrl?.trim()),
  );

  // ── Required (3 items → 60% weight total → 20% each) ──────────────────────
  const required: CompletionItem[] = [
    {
      key: "title",
      label: "Título del curso",
      fulfilled: hasTitle,
      message: "Agrega un título al curso para poder publicarlo",
    },
    {
      key: "thumbnail",
      label: "Miniatura / portada",
      fulfilled: hasThumbnail,
      message: "Agrega una miniatura para poder publicar el curso",
    },
    {
      key: "sections",
      label: "Al menos una sección",
      fulfilled: hasSections,
      message: "Crea al menos una sección con lecciones",
    },
  ];

  // ── Recommended (5 items → 40% weight total → 8% each) ────────────────────
  const recommended: CompletionItem[] = [
    {
      key: "description",
      label: "Descripción",
      fulfilled: hasDescription,
      message: "Agrega una descripción para mejorar la experiencia del alumno",
    },
    {
      key: "category",
      label: "Categoría",
      fulfilled: hasCategory,
      message: "Selecciona una categoría para que los alumnos te encuentren",
    },
    {
      key: "level",
      label: "Nivel",
      fulfilled: hasLevel,
      message: "Define el nivel del curso",
    },
    {
      key: "price",
      label: "Precio definido",
      fulfilled: hasPrice,
      message: "Define el precio del curso (o márcalo como gratuito)",
    },
    {
      key: "video_lesson",
      label: "Al menos una clase con video",
      fulfilled: hasVideoLesson,
      message: "Agrega al menos una clase de tipo video",
    },
  ];

  const canPublish = required.every((r) => r.fulfilled);
  const percentage = calcPercentage(required, recommended);
  const statusTone = deriveCourseTone(canPublish, percentage);
  const statusLabel = deriveCourseLabel(canPublish, percentage);

  // Stats
  const lessonCompletions = allLessons.map(getLessonCompletion);
  const lessonsReady = lessonCompletions.filter((l) => l.canPublish).length;
  const lessonsIncomplete = lessonCompletions.filter((l) => !l.canPublish).length;
  const totalDurationMinutes = getCourseDuration(sections);

  const stats: CourseStats = {
    totalSections: sections.length,
    totalLessons: allLessons.length,
    lessonsReady,
    lessonsIncomplete,
    totalDurationMinutes,
    totalDurationFormatted: formatDuration(totalDurationMinutes),
  };

  // Mensaje principal
  const firstMissingRequired = required.find((r) => !r.fulfilled);
  const firstMissingRecommended = recommended.find((r) => !r.fulfilled);
  const actionMessage = firstMissingRequired
    ? firstMissingRequired.message
    : firstMissingRecommended
      ? firstMissingRecommended.message
      : "Tu curso está listo para publicarse";

  return {
    percentage,
    required,
    recommended,
    canPublish,
    statusLabel,
    statusTone,
    actionMessage,
    stats,
  };
}

// ─── Publish validation (para server actions y API routes) ───────────────────

/**
 * Valida si un curso puede publicarse.
 * Recibe datos mínimos para funcionar tanto con CourseFormData como con datos de DB.
 */
export function validateCourseForPublish(data: {
  title: string;
  imageUrl?: string | null;
  sectionsCount: number;
}): { canPublish: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push("El curso debe tener un título para publicarse");
  }
  if (!data.imageUrl?.trim()) {
    errors.push("El curso debe tener una miniatura para publicarse");
  }
  if (data.sectionsCount === 0) {
    errors.push("El curso debe tener al menos una sección para publicarse");
  }

  return { canPublish: errors.length === 0, errors };
}

// ─── Duration formatter ───────────────────────────────────────────────────────

/**
 * Formatea minutos a texto legible. Ej: 90 → "1 h 30 min", 45 → "45 min"
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "—";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}
