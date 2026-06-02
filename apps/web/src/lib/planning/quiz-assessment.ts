export const DIAGNOSTIC_ASSESSMENT_TYPE = "evaluacion-diagnostica" as const;
export const FORMATIVE_ASSESSMENT_TYPE = "evaluacion-formativa" as const;
export const SUMMATIVE_ASSESSMENT_TYPE = "evaluacion-sumativa" as const;

export const QUIZ_ASSESSMENT_TYPES: string[] = [
  DIAGNOSTIC_ASSESSMENT_TYPE,
  FORMATIVE_ASSESSMENT_TYPE,
  SUMMATIVE_ASSESSMENT_TYPE,
];

export const ASSESSMENT_TITLE: Record<string, string> = {
  [DIAGNOSTIC_ASSESSMENT_TYPE]: "Evaluación diagnóstica",
  [FORMATIVE_ASSESSMENT_TYPE]: "Evaluación formativa",
  [SUMMATIVE_ASSESSMENT_TYPE]: "Evaluación sumativa",
};

export const QUESTIONNAIRE_TITLE: Record<string, string> = {
  [DIAGNOSTIC_ASSESSMENT_TYPE]: "Cuestionario diagnóstico",
  [FORMATIVE_ASSESSMENT_TYPE]: "Evaluación formativa",
  [SUMMATIVE_ASSESSMENT_TYPE]: "Evaluación sumativa",
};

export type QuizQuestion = {
  id: string;
  statement: string;
  options: string[];
};

export type QuizAssessmentData = {
  courseName: string;
  instructorName: string;
  location: string;
  date: string;
  schedule: string;
  duration: string;
  questionnaireTitle: string;
  instructions: string;
  questions: QuizQuestion[];
};

export function emptyQuestion(): QuizQuestion {
  return { id: crypto.randomUUID(), statement: "", options: ["", "", ""] };
}

export function createEmptyQuizAssessment(
  defaultQuestionnaireTitle: string,
  prefill?: { courseName?: string; instructorName?: string; duration?: string },
): QuizAssessmentData {
  return {
    courseName: prefill?.courseName ?? "",
    instructorName: prefill?.instructorName ?? "",
    location: "",
    date: "",
    schedule: "",
    duration: prefill?.duration ?? "",
    questionnaireTitle: defaultQuestionnaireTitle,
    instructions: "",
    questions: [emptyQuestion()],
  };
}

export function hydrateQuizAssessment(
  raw: unknown,
  defaultQuestionnaireTitle: string,
  prefill?: { courseName?: string; instructorName?: string; duration?: string },
): QuizAssessmentData {
  const base = createEmptyQuizAssessment(defaultQuestionnaireTitle, prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<QuizAssessmentData>;

  const questions =
    Array.isArray(data.questions) && data.questions.length > 0
      ? data.questions.map((p) => ({
          id: p.id || crypto.randomUUID(),
          statement: p.statement ?? "",
          options: Array.isArray(p.options) && p.options.length > 0 ? p.options.map((o) => o ?? "") : ["", "", ""],
        }))
      : base.questions;

  return { ...base, ...data, questions };
}

export function optionLetter(index: number): string {
  return String.fromCharCode(97 + index);
}
