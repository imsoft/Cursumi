/**
 * Tipos y utilidades del "Contrato de aprendizaje".
 * Cuarto documento de planeación didáctica (solo cursos presenciales).
 *
 * Se guarda en `CoursePlanningDocument.data` con `type = "contrato-aprendizaje"`.
 */

export const CONTRATO_APRENDIZAJE_TYPE = "contrato-aprendizaje" as const;

export type CompromisoRow = {
  id: string;
  descripcion: string;
};

export type ContratoAprendizajeData = {
  // Encabezado
  nombreCurso: string;
  nombreInstructor: string;
  lugar: string;
  duracion: string;
  horario: string;
  fecha: string;
  // Compromisos
  compromisosFacilitador: CompromisoRow[];
  compromisosParticipante: CompromisoRow[];
};

const DEFAULT_FACILITADOR = [
  "Se compromete a respetar a los participantes y escuchar y entender las dudas que tengan.",
  "Se compromete a impartir de manera clara y directa toda la información del curso.",
  "Se compromete a proporcionar todo el material que necesitan los participantes para cumplir con el curso.",
  "Se compromete a evaluar de manera correcta y justa a todos los participantes.",
];

const DEFAULT_PARTICIPANTE = [
  "Se compromete a prestar atención en todo momento.",
  "Se compromete a respetar al instructor y a sus compañeros en todo momento.",
  "Se compromete a ser participativo en las actividades que sean impartidas durante el curso.",
  "Se compromete a exponer sus dudas con respeto.",
  "Se compromete a cuidar y respetar el material didáctico y material del lugar.",
  "Se compromete a no divulgar el material de estudio sin permiso.",
];

function row(descripcion = ""): CompromisoRow {
  return { id: crypto.randomUUID(), descripcion };
}

export { row as emptyCompromiso };

export function createEmptyContratoAprendizaje(prefill?: {
  nombreCurso?: string;
  nombreInstructor?: string;
  duracion?: string;
}): ContratoAprendizajeData {
  return {
    nombreCurso: prefill?.nombreCurso ?? "",
    nombreInstructor: prefill?.nombreInstructor ?? "",
    lugar: "",
    duracion: prefill?.duracion ?? "",
    horario: "",
    fecha: "",
    compromisosFacilitador: DEFAULT_FACILITADOR.map((d) => row(d)),
    compromisosParticipante: DEFAULT_PARTICIPANTE.map((d) => row(d)),
  };
}

export function hydrateContratoAprendizaje(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyContratoAprendizaje>[0],
): ContratoAprendizajeData {
  const base = createEmptyContratoAprendizaje(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<ContratoAprendizajeData>;

  const ensureRows = (rows: CompromisoRow[] | undefined, fallback: CompromisoRow[]): CompromisoRow[] => {
    if (!Array.isArray(rows)) return fallback;
    if (rows.length === 0) return [row()];
    return rows.map((r) => ({ id: r.id || crypto.randomUUID(), descripcion: r.descripcion ?? "" }));
  };

  return {
    ...base,
    ...data,
    compromisosFacilitador: ensureRows(data.compromisosFacilitador, base.compromisosFacilitador),
    compromisosParticipante: ensureRows(data.compromisosParticipante, base.compromisosParticipante),
  };
}
