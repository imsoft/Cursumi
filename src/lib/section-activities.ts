import type {
  SectionActivity,
  SectionMinigame,
  SectionQuiz,
  SectionQuizQuestion,
} from "@/components/instructor/course-types";

const LEGACY_QUIZ_ID = "default";
const LEGACY_MINI_ID = "default";

function isActivityArray(raw: unknown): raw is SectionActivity[] {
  return Array.isArray(raw) && raw.length > 0 && typeof (raw[0] as { kind?: string }).kind === "string";
}

/** Normaliza datos de BD (activities + legacy quiz/minigame) a lista ordenada de actividades. */
export function normalizeSectionActivities(section: {
  activities?: unknown;
  quiz?: unknown;
  minigame?: unknown;
}): SectionActivity[] {
  const raw = section.activities;
  if (isActivityArray(raw)) {
    return raw
      .map((a) => normalizeOneActivity(a))
      .filter((a): a is SectionActivity => a !== null);
  }

  const out: SectionActivity[] = [];
  const q = section.quiz as SectionQuiz | undefined;
  if (q && Array.isArray(q.questions) && q.questions.length > 0 && typeof q.passingScore === "number") {
    out.push({
      id: LEGACY_QUIZ_ID,
      kind: "quiz",
      passingScore: q.passingScore,
      questions: q.questions,
    });
  }
  const m = section.minigame as SectionMinigame | undefined;
  if (m && typeof (m as { type?: string }).type === "string") {
    out.push({ id: LEGACY_MINI_ID, kind: "minigame", minigame: m });
  }
  return out;
}

function normalizeOneActivity(a: unknown): SectionActivity | null {
  if (!a || typeof a !== "object") return null;
  const o = a as Record<string, unknown>;
  const id =
    typeof o.id === "string" && o.id.length > 0
      ? o.id
      : `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  if (o.kind === "quiz" && typeof o.passingScore === "number" && Array.isArray(o.questions)) {
    return {
      id,
      kind: "quiz",
      passingScore: o.passingScore,
      questions: o.questions as SectionQuizQuestion[],
    };
  }
  if (o.kind === "minigame" && o.minigame && typeof o.minigame === "object") {
    return { id, kind: "minigame", minigame: o.minigame as SectionMinigame };
  }
  return null;
}

export function countSectionGateActivities(section: {
  activities?: unknown;
  quiz?: unknown;
  minigame?: unknown;
}): number {
  return normalizeSectionActivities(section).length;
}

export function persistSectionActivitiesPayload(activities: SectionActivity[] | undefined): {
  activities: SectionActivity[] | null;
  quiz: null;
  minigame: null;
} {
  if (!activities || activities.length === 0) {
    return { activities: null, quiz: null, minigame: null };
  }
  return {
    activities,
    quiz: null,
    minigame: null,
  };
}

export function ensureActivityIds(list: SectionActivity[]): SectionActivity[] {
  return list.map((a) =>
    a.id?.length
      ? a
      : {
          ...a,
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        },
  );
}

export type { SectionActivity };
