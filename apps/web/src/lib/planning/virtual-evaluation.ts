import type { PlanningPrefill } from "./prefill";

export const VIRTUAL_EVALUATION_TYPE = "virtual-evaluation" as const;

export const DEFAULT_QUALITY_SCALE = ["Muy Malo", "Malo", "Regular", "Muy Bueno", "Excelente"];

// ── Knowledge evaluation (one per tema) ─────────────────────────────────────

export type EvaluationOption = {
  id: string;
  text: string;
  correct: boolean;
};

export type EvaluationQuestion = {
  id: string;
  statement: string;
  options: EvaluationOption[];
};

export type KnowledgeEvaluation = {
  id: string;
  title: string;
  instructions: string;
  questions: EvaluationQuestion[];
};

// ── Quality questionnaire ───────────────────────────────────────────────────

export type QualityQuestion = {
  id: string;
  statement: string;
};

export type QualitySection = {
  id: string;
  title: string;
  questions: QualityQuestion[];
};

export type VirtualEvaluationData = {
  courseName: string;
  referenceStandard: string;
  showTableOfContents: boolean;
  presentation: string;
  knowledgeEvaluations: KnowledgeEvaluation[];
  qualityInstructions: string;
  qualityScale: string[];
  qualitySections: QualitySection[];
};

// ── Builders ────────────────────────────────────────────────────────────────

export function emptyEvaluationOption(text = "", correct = false): EvaluationOption {
  return { id: crypto.randomUUID(), text, correct };
}

export function emptyEvaluationQuestion(): EvaluationQuestion {
  return {
    id: crypto.randomUUID(),
    statement: "",
    options: [emptyEvaluationOption("", true), emptyEvaluationOption(), emptyEvaluationOption()],
  };
}

export function emptyKnowledgeEvaluation(): KnowledgeEvaluation {
  return {
    id: crypto.randomUUID(),
    title: "",
    instructions: "",
    questions: [emptyEvaluationQuestion()],
  };
}

export function emptyQualityQuestion(): QualityQuestion {
  return { id: crypto.randomUUID(), statement: "" };
}

export function emptyQualitySection(): QualitySection {
  return { id: crypto.randomUUID(), title: "", questions: [emptyQualityQuestion()] };
}

export function createEmptyVirtualEvaluation(prefill?: Partial<PlanningPrefill>): VirtualEvaluationData {
  // Evaluación de conocimientos sembrada con las preguntas del examen del curso
  const knowledgeEvaluations: KnowledgeEvaluation[] = prefill?.questions?.length
    ? [
        {
          id: crypto.randomUUID(),
          title: prefill.courseName ? `Evaluación — ${prefill.courseName}` : "Evaluación de conocimientos",
          instructions: "",
          questions: prefill.questions.map((q) => ({
            id: crypto.randomUUID(),
            statement: q.statement,
            options:
              q.options.length > 0
                ? q.options.map((text, i) => emptyEvaluationOption(text, i === q.correctIndex))
                : [emptyEvaluationOption("", true), emptyEvaluationOption(), emptyEvaluationOption()],
          })),
        },
      ]
    : [emptyKnowledgeEvaluation()];

  return {
    courseName: prefill?.courseName ?? "",
    referenceStandard: "",
    showTableOfContents: true,
    presentation: "",
    knowledgeEvaluations,
    qualityInstructions: "",
    qualityScale: [...DEFAULT_QUALITY_SCALE],
    qualitySections: [emptyQualitySection()],
  };
}

export function hydrateVirtualEvaluation(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyVirtualEvaluation>[0],
): VirtualEvaluationData {
  const base = createEmptyVirtualEvaluation(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<VirtualEvaluationData>;

  const knowledgeEvaluations =
    Array.isArray(data.knowledgeEvaluations) && data.knowledgeEvaluations.length > 0
      ? data.knowledgeEvaluations.map((ev) => ({
          id: ev.id || crypto.randomUUID(),
          title: ev.title ?? "",
          instructions: ev.instructions ?? "",
          questions:
            Array.isArray(ev.questions) && ev.questions.length > 0
              ? ev.questions.map((q) => ({
                  id: q.id || crypto.randomUUID(),
                  statement: q.statement ?? "",
                  options:
                    Array.isArray(q.options) && q.options.length > 0
                      ? q.options.map((o) => ({
                          id: o.id || crypto.randomUUID(),
                          text: o.text ?? "",
                          correct: Boolean(o.correct),
                        }))
                      : [emptyEvaluationOption("", true), emptyEvaluationOption(), emptyEvaluationOption()],
                }))
              : [emptyEvaluationQuestion()],
        }))
      : base.knowledgeEvaluations;

  const qualityScale =
    Array.isArray(data.qualityScale) && data.qualityScale.length > 0
      ? data.qualityScale.map((o) => o ?? "")
      : base.qualityScale;

  const qualitySections =
    Array.isArray(data.qualitySections) && data.qualitySections.length > 0
      ? data.qualitySections.map((s) => ({
          id: s.id || crypto.randomUUID(),
          title: s.title ?? "",
          questions:
            Array.isArray(s.questions) && s.questions.length > 0
              ? s.questions.map((q) => ({ id: q.id || crypto.randomUUID(), statement: q.statement ?? "" }))
              : [emptyQualityQuestion()],
        }))
      : base.qualitySections;

  return {
    ...base,
    ...data,
    knowledgeEvaluations,
    qualityScale,
    qualitySections,
  };
}

/** Letra de la opción según su índice (0 → "a", 1 → "b", …). */
export function optionLetter(index: number): string {
  return String.fromCharCode(97 + index);
}
