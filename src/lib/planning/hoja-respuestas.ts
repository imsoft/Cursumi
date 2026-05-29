/**
 * Tipos y utilidades de la "Hoja de Respuestas" (clave de respuestas):
 * portada + contenido agrupado por temas, donde cada pregunta marca la opción
 * correcta (se resalta en el PDF).
 */

export const HOJA_RESPUESTAS_TYPE = "hoja-respuestas" as const;

export type PreguntaRespuesta = {
  id: string;
  enunciado: string;
  opciones: string[];
  /** Índice de la opción correcta (null si aún no se define). */
  correctaIndex: number | null;
};

export type TemaRespuestas = {
  id: string;
  titulo: string;
  instrucciones: string;
  preguntas: PreguntaRespuesta[];
};

export type HojaRespuestasData = {
  // Portada / encabezado
  nombreCurso: string;
  nombreInstructor: string;
  lugar: string;
  fecha: string;
  horario: string;
  duracion: string;
  // Contenido
  tituloDocumento: string;
  temas: TemaRespuestas[];
};

export function emptyPreguntaRespuesta(): PreguntaRespuesta {
  return { id: crypto.randomUUID(), enunciado: "", opciones: ["", "", ""], correctaIndex: null };
}

export function emptyTemaRespuestas(numero: number): TemaRespuestas {
  return {
    id: crypto.randomUUID(),
    titulo: `Tema ${numero}: `,
    instrucciones: `El participante elegirá la respuesta correcta con base en lo aprendido en el tema ${numero} del curso.`,
    preguntas: [emptyPreguntaRespuesta()],
  };
}

export function createEmptyHojaRespuestas(prefill?: {
  nombreCurso?: string;
  nombreInstructor?: string;
  duracion?: string;
}): HojaRespuestasData {
  return {
    nombreCurso: prefill?.nombreCurso ?? "",
    nombreInstructor: prefill?.nombreInstructor ?? "",
    lugar: "",
    fecha: "",
    horario: "",
    duracion: prefill?.duracion ?? "",
    tituloDocumento: "Hoja de Respuestas",
    temas: [emptyTemaRespuestas(1)],
  };
}

export function hydrateHojaRespuestas(
  raw: unknown,
  prefill?: { nombreCurso?: string; nombreInstructor?: string; duracion?: string },
): HojaRespuestasData {
  const base = createEmptyHojaRespuestas(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<HojaRespuestasData>;

  const temas =
    Array.isArray(data.temas) && data.temas.length > 0
      ? data.temas.map((t) => ({
          id: t.id || crypto.randomUUID(),
          titulo: t.titulo ?? "",
          instrucciones: t.instrucciones ?? "",
          preguntas:
            Array.isArray(t.preguntas) && t.preguntas.length > 0
              ? t.preguntas.map((p) => ({
                  id: p.id || crypto.randomUUID(),
                  enunciado: p.enunciado ?? "",
                  opciones: Array.isArray(p.opciones) && p.opciones.length > 0 ? p.opciones.map((o) => o ?? "") : ["", "", ""],
                  correctaIndex: typeof p.correctaIndex === "number" ? p.correctaIndex : null,
                }))
              : [emptyPreguntaRespuesta()],
        }))
      : base.temas;

  return { ...base, ...data, temas };
}
