export const ANSWER_SHEET_TYPE = "hoja-respuestas" as const;

export type AnswerQuestion = {
  id: string;
  statement: string;
  options: string[];
  correctIndex: number | null;
};

export type AnswerTopic = {
  id: string;
  title: string;
  instructions: string;
  questions: AnswerQuestion[];
};

export type AnswerSheetData = {
  courseName: string;
  instructorName: string;
  location: string;
  date: string;
  schedule: string;
  duration: string;
  documentTitle: string;
  topics: AnswerTopic[];
};

export function emptyAnswerQuestion(): AnswerQuestion {
  return { id: crypto.randomUUID(), statement: "", options: ["", "", ""], correctIndex: null };
}

export function emptyAnswerTopic(number: number): AnswerTopic {
  return {
    id: crypto.randomUUID(),
    title: `Tema ${number}: `,
    instructions: `El participante elegirá la respuesta correcta con base en lo aprendido en el tema ${number} del curso.`,
    questions: [emptyAnswerQuestion()],
  };
}

export function createEmptyAnswerSheet(prefill?: {
  courseName?: string;
  instructorName?: string;
  duration?: string;
}): AnswerSheetData {
  return {
    courseName: prefill?.courseName ?? "",
    instructorName: prefill?.instructorName ?? "",
    location: "",
    date: "",
    schedule: "",
    duration: prefill?.duration ?? "",
    documentTitle: "Hoja de Respuestas",
    topics: [emptyAnswerTopic(1)],
  };
}

export function hydrateAnswerSheet(
  raw: unknown,
  prefill?: { courseName?: string; instructorName?: string; duration?: string },
): AnswerSheetData {
  const base = createEmptyAnswerSheet(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<AnswerSheetData>;

  const topics =
    Array.isArray(data.topics) && data.topics.length > 0
      ? data.topics.map((t) => ({
          id: t.id || crypto.randomUUID(),
          title: t.title ?? "",
          instructions: t.instructions ?? "",
          questions:
            Array.isArray(t.questions) && t.questions.length > 0
              ? t.questions.map((p) => ({
                  id: p.id || crypto.randomUUID(),
                  statement: p.statement ?? "",
                  options: Array.isArray(p.options) && p.options.length > 0 ? p.options.map((o) => o ?? "") : ["", "", ""],
                  correctIndex: typeof p.correctIndex === "number" ? p.correctIndex : null,
                }))
              : [emptyAnswerQuestion()],
        }))
      : base.topics;

  return { ...base, ...data, topics };
}
