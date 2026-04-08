import type {
  SectionActivity,
  SectionMinigame,
  SectionQuiz,
} from "@/components/instructor/course-types";
import { normalizeSectionActivities } from "@/lib/section-activities";

export function parseSectionQuizFromLessonContent(content: string | null | undefined): SectionQuiz | null {
  if (!content?.trim()) return null;
  try {
    const p = JSON.parse(content) as unknown;
    if (!p || typeof p !== "object") return null;
    const o = p as Record<string, unknown>;
    if (typeof o.passingScore !== "number" || !Array.isArray(o.questions)) return null;
    return {
      passingScore: o.passingScore,
      questions: o.questions as SectionQuiz["questions"],
    };
  } catch {
    return null;
  }
}

export function parseSectionMinigameFromLessonContent(content: string | null | undefined): SectionMinigame | null {
  if (!content?.trim()) return null;
  try {
    const p = JSON.parse(content) as unknown;
    if (!p || typeof p !== "object") return null;
    const o = p as { type?: string };
    if (typeof o.type !== "string") return null;
    return p as SectionMinigame;
  } catch {
    return null;
  }
}

export function stringifySectionQuizPayload(q: SectionQuiz): string {
  return JSON.stringify(q);
}

export function stringifySectionMinigamePayload(m: SectionMinigame): string {
  return JSON.stringify(m);
}

/** Construye una actividad de cierre para el visor (activityId = lesson.id). */
export function gateActivityFromLesson(lesson: {
  id: string;
  type: string;
  content: string | null;
}): SectionActivity | null {
  if (lesson.type === "section_quiz") {
    const q = parseSectionQuizFromLessonContent(lesson.content);
    if (!q?.questions?.length || typeof q.passingScore !== "number") return null;
    return {
      id: lesson.id,
      kind: "quiz",
      passingScore: q.passingScore,
      questions: q.questions,
    };
  }
  if (lesson.type === "section_minigame") {
    const m = parseSectionMinigameFromLessonContent(lesson.content);
    if (!m) return null;
    return { id: lesson.id, kind: "minigame", minigame: m };
  }
  return null;
}

/**
 * Unidades de “cierre de sección” para sidebar y bloqueo de navegación.
 * Si hay datos legacy en la sección (quiz/minigame/activities), solo esos cuentan.
 * Si no, una fila por lección `section_quiz` / `section_minigame` con contenido válido.
 */
export function listSectionGateUnitsForUi(section: {
  id: string;
  quiz?: unknown;
  minigame?: unknown;
  activities?: unknown;
  lessons?: Array<{ id: string; type: string; content: string | null }>;
}): { sectionId: string; activityId: string }[] {
  const legacy = normalizeSectionActivities(section);
  if (legacy.length > 0) {
    return legacy.map((a) => ({ sectionId: section.id, activityId: a.id }));
  }
  const out: { sectionId: string; activityId: string }[] = [];
  for (const l of section.lessons ?? []) {
    if (l.type !== "section_quiz" && l.type !== "section_minigame") continue;
    if (gateActivityFromLesson(l)) {
      out.push({ sectionId: section.id, activityId: l.id });
    }
  }
  return out;
}
