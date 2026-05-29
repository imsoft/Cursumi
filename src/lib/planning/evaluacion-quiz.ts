/**
 * Tipos y utilidades compartidos para las evaluaciones tipo cuestionario:
 * diagnóstica, formativa y sumativa. Todas comparten portada + cuestionario
 * de opción múltiple (se imprime en blanco para que el participante responda).
 *
 * Cada variante se guarda con su propio `type` en `CoursePlanningDocument`.
 */

export const EVALUACION_DIAGNOSTICA_TYPE = "evaluacion-diagnostica" as const;
export const EVALUACION_FORMATIVA_TYPE = "evaluacion-formativa" as const;
export const EVALUACION_SUMATIVA_TYPE = "evaluacion-sumativa" as const;

export const EVALUACION_QUIZ_TYPES: string[] = [
  EVALUACION_DIAGNOSTICA_TYPE,
  EVALUACION_FORMATIVA_TYPE,
  EVALUACION_SUMATIVA_TYPE,
];

/** Título grande de la portada por tipo. */
export const EVALUACION_TITULO: Record<string, string> = {
  [EVALUACION_DIAGNOSTICA_TYPE]: "Evaluación diagnóstica",
  [EVALUACION_FORMATIVA_TYPE]: "Evaluación formativa",
  [EVALUACION_SUMATIVA_TYPE]: "Evaluación sumativa",
};

/** Encabezado por defecto del cuestionario por tipo. */
export const EVALUACION_CUESTIONARIO_TITULO: Record<string, string> = {
  [EVALUACION_DIAGNOSTICA_TYPE]: "Cuestionario diagnóstico",
  [EVALUACION_FORMATIVA_TYPE]: "Evaluación formativa",
  [EVALUACION_SUMATIVA_TYPE]: "Evaluación sumativa",
};

export type PreguntaQuiz = {
  id: string;
  enunciado: string;
  opciones: string[];
};

export type EvaluacionQuizData = {
  // Portada / encabezado
  nombreCurso: string;
  nombreInstructor: string;
  lugar: string;
  fecha: string;
  horario: string;
  duracion: string;
  // Cuestionario
  tituloCuestionario: string;
  /** Texto opcional con indicaciones (p. ej. "Cada pregunta vale 5 puntos"). */
  instrucciones: string;
  preguntas: PreguntaQuiz[];
};

export function emptyPregunta(): PreguntaQuiz {
  return { id: crypto.randomUUID(), enunciado: "", opciones: ["", "", ""] };
}

export function createEmptyEvaluacionQuiz(
  defaultCuestionarioTitulo: string,
  prefill?: { nombreCurso?: string; nombreInstructor?: string; duracion?: string },
): EvaluacionQuizData {
  return {
    nombreCurso: prefill?.nombreCurso ?? "",
    nombreInstructor: prefill?.nombreInstructor ?? "",
    lugar: "",
    fecha: "",
    horario: "",
    duracion: prefill?.duracion ?? "",
    tituloCuestionario: defaultCuestionarioTitulo,
    instrucciones: "",
    preguntas: [emptyPregunta()],
  };
}

export function hydrateEvaluacionQuiz(
  raw: unknown,
  defaultCuestionarioTitulo: string,
  prefill?: { nombreCurso?: string; nombreInstructor?: string; duracion?: string },
): EvaluacionQuizData {
  const base = createEmptyEvaluacionQuiz(defaultCuestionarioTitulo, prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<EvaluacionQuizData>;

  const preguntas =
    Array.isArray(data.preguntas) && data.preguntas.length > 0
      ? data.preguntas.map((p) => ({
          id: p.id || crypto.randomUUID(),
          enunciado: p.enunciado ?? "",
          opciones: Array.isArray(p.opciones) && p.opciones.length > 0 ? p.opciones.map((o) => o ?? "") : ["", "", ""],
        }))
      : base.preguntas;

  return { ...base, ...data, preguntas };
}

/** Letra de la opción según su índice (0 → "a", 1 → "b", …). */
export function opcionLetra(index: number): string {
  return String.fromCharCode(97 + index);
}
