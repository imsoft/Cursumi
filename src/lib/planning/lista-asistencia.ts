/**
 * Tipos y utilidades de la "Lista de asistencia".
 * Tercer documento de planeación didáctica (solo cursos presenciales).
 *
 * Se guarda en `CoursePlanningDocument.data` con `type = "lista-asistencia"`.
 */

export const LISTA_ASISTENCIA_TYPE = "lista-asistencia" as const;

export type AsistenciaRow = {
  id: string;
  nombre: string;
};

export type ListaAsistenciaData = {
  // Encabezado
  nombreCurso: string;
  nombreInstructor: string;
  lugar: string;
  duracion: string;
  horario: string;
  fecha: string;
  // Participantes (la firma se deja en blanco para firmar en el PDF impreso)
  participantes: AsistenciaRow[];
};

const DEFAULT_ROWS = 10;

function emptyRow(): AsistenciaRow {
  return { id: crypto.randomUUID(), nombre: "" };
}

export { emptyRow };

export function createEmptyListaAsistencia(prefill?: {
  nombreCurso?: string;
  nombreInstructor?: string;
  duracion?: string;
}): ListaAsistenciaData {
  return {
    nombreCurso: prefill?.nombreCurso ?? "",
    nombreInstructor: prefill?.nombreInstructor ?? "",
    lugar: "",
    duracion: prefill?.duracion ?? "",
    horario: "",
    fecha: "",
    participantes: Array.from({ length: DEFAULT_ROWS }, emptyRow),
  };
}

export function hydrateListaAsistencia(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyListaAsistencia>[0],
): ListaAsistenciaData {
  const base = createEmptyListaAsistencia(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<ListaAsistenciaData>;

  const participantes =
    Array.isArray(data.participantes) && data.participantes.length > 0
      ? data.participantes.map((p) => ({ id: p.id || crypto.randomUUID(), nombre: p.nombre ?? "" }))
      : base.participantes;

  return { ...base, ...data, participantes };
}
