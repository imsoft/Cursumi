export const QUALITY_ASSESSMENT_TYPE = "evaluacion-calidad" as const;

export const DEFAULT_QUALITY_SCALE = ["Muy Malo", "Malo", "Regular", "Muy Bueno", "Excelente"];

export type QualityQuestion = {
  id: string;
  statement: string;
};

export type QualitySection = {
  id: string;
  title: string;
  questions: QualityQuestion[];
};

export type QualityAssessmentData = {
  courseName: string;
  instructorName: string;
  location: string;
  date: string;
  schedule: string;
  duration: string;
  questionnaireTitle: string;
  instructions: string;
  scale: string[];
  sections: QualitySection[];
};

function question(statement: string): QualityQuestion {
  return { id: crypto.randomUUID(), statement };
}

export function emptyQualityQuestion(): QualityQuestion {
  return question("");
}

export function emptyQualitySection(): QualitySection {
  return { id: crypto.randomUUID(), title: "", questions: [emptyQualityQuestion()] };
}

function defaultSections(): QualitySection[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Instructor",
      questions: [
        question("¿Cómo calificarías el dominio del tema por parte del instructor?"),
        question("¿Cómo calificarías la forma en que el instructor expuso la información?"),
        question("¿Cómo calificarías la forma en que el instructor expone las instrucciones de las actividades?"),
      ],
    },
    {
      id: crypto.randomUUID(),
      title: "Contenido",
      questions: [
        question("¿Cómo calificarías el contenido expuesto en el curso?"),
        question("¿Cómo calificarías la relevancia que tiene la información que acabas de aprender con tu día a día?"),
        question("¿Cómo calificarías la claridad que tiene la información expuesta?"),
        question("¿Cómo calificarías el material de apoyo del curso?"),
      ],
    },
    {
      id: crypto.randomUUID(),
      title: "Curso",
      questions: [
        question("¿Cómo calificarías la extensión del curso?"),
        question("¿Cómo calificarías el diseño del curso?"),
      ],
    },
  ];
}

export function createEmptyQualityAssessment(prefill?: {
  courseName?: string;
  instructorName?: string;
  duration?: string;
}): QualityAssessmentData {
  return {
    courseName: prefill?.courseName ?? "",
    instructorName: prefill?.instructorName ?? "",
    location: "",
    date: "",
    schedule: "",
    duration: prefill?.duration ?? "",
    questionnaireTitle: "Cuestionario de calidad",
    instructions:
      "El participante elegirá las respuestas que decida sean las más apropiadas a cada pregunta para poder calificar el curso, el contenido y al instructor. Tendrá 30 minutos para contestarlo y no tendrá ponderación alguna sobre su calificación final.",
    scale: [...DEFAULT_QUALITY_SCALE],
    sections: defaultSections(),
  };
}

export function hydrateQualityAssessment(
  raw: unknown,
  prefill?: { courseName?: string; instructorName?: string; duration?: string },
): QualityAssessmentData {
  const base = createEmptyQualityAssessment(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<QualityAssessmentData>;

  const scale = Array.isArray(data.scale) && data.scale.length > 0 ? data.scale.map((o) => o ?? "") : base.scale;

  const sections =
    Array.isArray(data.sections) && data.sections.length > 0
      ? data.sections.map((s) => ({
          id: s.id || crypto.randomUUID(),
          title: s.title ?? "",
          questions:
            Array.isArray(s.questions) && s.questions.length > 0
              ? s.questions.map((p) => ({ id: p.id || crypto.randomUUID(), statement: p.statement ?? "" }))
              : [emptyQualityQuestion()],
        }))
      : base.sections;

  return { ...base, ...data, scale, sections };
}
