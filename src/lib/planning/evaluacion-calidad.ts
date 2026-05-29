/**
 * Tipos y utilidades de la "Evaluación de calidad" (encuesta de satisfacción):
 * portada + cuestionario agrupado en secciones (Instructor, Contenido, Curso),
 * donde todas las preguntas comparten una misma escala (Muy Malo → Excelente).
 */

export const EVALUACION_CALIDAD_TYPE = "evaluacion-calidad" as const;

export const ESCALA_CALIDAD_DEFAULT = ["Muy Malo", "Malo", "Regular", "Muy Bueno", "Excelente"];

export type PreguntaCalidad = {
  id: string;
  enunciado: string;
};

export type SeccionCalidad = {
  id: string;
  titulo: string;
  preguntas: PreguntaCalidad[];
};

export type EvaluacionCalidadData = {
  // Portada / encabezado
  nombreCurso: string;
  nombreInstructor: string;
  lugar: string;
  fecha: string;
  horario: string;
  duracion: string;
  // Cuestionario
  tituloCuestionario: string;
  instrucciones: string;
  escala: string[];
  secciones: SeccionCalidad[];
};

function pregunta(enunciado: string): PreguntaCalidad {
  return { id: crypto.randomUUID(), enunciado };
}

export function emptyPreguntaCalidad(): PreguntaCalidad {
  return pregunta("");
}

export function emptySeccionCalidad(): SeccionCalidad {
  return { id: crypto.randomUUID(), titulo: "", preguntas: [emptyPreguntaCalidad()] };
}

function seccionesPorDefecto(): SeccionCalidad[] {
  return [
    {
      id: crypto.randomUUID(),
      titulo: "Instructor",
      preguntas: [
        pregunta("¿Cómo calificarías el dominio del tema por parte del instructor?"),
        pregunta("¿Cómo calificarías la forma en que el instructor expuso la información?"),
        pregunta("¿Cómo calificarías la forma en que el instructor expone las instrucciones de las actividades?"),
      ],
    },
    {
      id: crypto.randomUUID(),
      titulo: "Contenido",
      preguntas: [
        pregunta("¿Cómo calificarías el contenido expuesto en el curso?"),
        pregunta("¿Cómo calificarías la relevancia que tiene la información que acabas de aprender con tu día a día?"),
        pregunta("¿Cómo calificarías la claridad que tiene la información expuesta?"),
        pregunta("¿Cómo calificarías el material de apoyo del curso?"),
      ],
    },
    {
      id: crypto.randomUUID(),
      titulo: "Curso",
      preguntas: [
        pregunta("¿Cómo calificarías la extensión del curso?"),
        pregunta("¿Cómo calificarías el diseño del curso?"),
      ],
    },
  ];
}

export function createEmptyEvaluacionCalidad(prefill?: {
  nombreCurso?: string;
  nombreInstructor?: string;
  duracion?: string;
}): EvaluacionCalidadData {
  return {
    nombreCurso: prefill?.nombreCurso ?? "",
    nombreInstructor: prefill?.nombreInstructor ?? "",
    lugar: "",
    fecha: "",
    horario: "",
    duracion: prefill?.duracion ?? "",
    tituloCuestionario: "Cuestionario de calidad",
    instrucciones:
      "El participante elegirá las respuestas que decida sean las más apropiadas a cada pregunta para poder calificar el curso, el contenido y al instructor. Tendrá 30 minutos para contestarlo y no tendrá ponderación alguna sobre su calificación final.",
    escala: [...ESCALA_CALIDAD_DEFAULT],
    secciones: seccionesPorDefecto(),
  };
}

export function hydrateEvaluacionCalidad(
  raw: unknown,
  prefill?: { nombreCurso?: string; nombreInstructor?: string; duracion?: string },
): EvaluacionCalidadData {
  const base = createEmptyEvaluacionCalidad(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<EvaluacionCalidadData>;

  const escala = Array.isArray(data.escala) && data.escala.length > 0 ? data.escala.map((o) => o ?? "") : base.escala;

  const secciones =
    Array.isArray(data.secciones) && data.secciones.length > 0
      ? data.secciones.map((s) => ({
          id: s.id || crypto.randomUUID(),
          titulo: s.titulo ?? "",
          preguntas:
            Array.isArray(s.preguntas) && s.preguntas.length > 0
              ? s.preguntas.map((p) => ({ id: p.id || crypto.randomUUID(), enunciado: p.enunciado ?? "" }))
              : [emptyPreguntaCalidad()],
        }))
      : base.secciones;

  return { ...base, ...data, escala, secciones };
}
