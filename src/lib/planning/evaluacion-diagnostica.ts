/**
 * Tipos y utilidades de la "Evaluación diagnóstica".
 * Quinto documento de planeación didáctica (solo cursos presenciales).
 *
 * Tiene portada + cuestionario de opción múltiple (en blanco para que el
 * participante lo responda en el PDF impreso).
 *
 * Se guarda en `CoursePlanningDocument.data` con `type = "evaluacion-diagnostica"`.
 */

export const EVALUACION_DIAGNOSTICA_TYPE = "evaluacion-diagnostica" as const;

export type PreguntaDiagnostica = {
  id: string;
  enunciado: string;
  opciones: string[];
};

export type EvaluacionDiagnosticaData = {
  // Portada / encabezado
  nombreCurso: string;
  nombreInstructor: string;
  lugar: string;
  fecha: string;
  horario: string;
  duracion: string;
  // Cuestionario
  tituloCuestionario: string;
  preguntas: PreguntaDiagnostica[];
};

export function emptyPregunta(): PreguntaDiagnostica {
  return { id: crypto.randomUUID(), enunciado: "", opciones: ["", "", ""] };
}

export function createEmptyEvaluacionDiagnostica(prefill?: {
  nombreCurso?: string;
  nombreInstructor?: string;
  duracion?: string;
}): EvaluacionDiagnosticaData {
  return {
    nombreCurso: prefill?.nombreCurso ?? "",
    nombreInstructor: prefill?.nombreInstructor ?? "",
    lugar: "",
    fecha: "",
    horario: "",
    duracion: prefill?.duracion ?? "",
    tituloCuestionario: "Cuestionario diagnóstico",
    preguntas: [emptyPregunta()],
  };
}

export function hydrateEvaluacionDiagnostica(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyEvaluacionDiagnostica>[0],
): EvaluacionDiagnosticaData {
  const base = createEmptyEvaluacionDiagnostica(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<EvaluacionDiagnosticaData>;

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
