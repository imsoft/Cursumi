/**
 * Tipos y utilidades de la "Carta Descriptiva" (Documento de Planeación del Curso).
 * Es el primer documento de planeación didáctica que llena el instructor.
 *
 * El contenido se guarda en `CoursePlanningDocument.data` con `type = "carta-descriptiva"`.
 */

export const CARTA_DESCRIPTIVA_TYPE = "carta-descriptiva" as const;

/** Objetivo general: redactado como sujeto + acción + condición. */
export type ObjetivoGeneral = {
  sujeto: string;
  accion: string;
  condicion: string;
};

/** Fila de objetivo particular por dominio de aprendizaje. */
export type ObjetivoParticular = {
  sujeto: string;
  accion: string;
  condicion: string;
  /** Temas relacionados, uno por línea. */
  temas: string;
};

/** Fila de la tabla de criterios de evaluación. */
export type EvaluacionCriterio = {
  id: string;
  aspecto: string;
  porcentaje: string;
  instrumento: string;
  momento: string;
  tipo: string;
};

/** Comprobación de existencia y funcionamiento de recursos (una sola fila). */
export type ComprobacionRecursos = {
  etapa: string;
  actividades: string;
  duracion: string;
  tecnicas: string;
  material: string;
};

/**
 * Fila genérica de las tablas de Apertura, Desarrollo y Cierre.
 * `duracionMin` se guarda en minutos para calcular las sumatorias automáticamente.
 */
export type ActividadFila = {
  id: string;
  /** "Etapa del encuadre" (apertura) o "Temas/Subtemas" (desarrollo/cierre). */
  temaEtapa: string;
  actividades: string;
  duracionMin: number | null;
  tecnicas: string;
  material: string;
};

export type CartaDescriptivaData = {
  // 1. Información general
  nombreCurso: string;
  nombreInstructor: string;
  lugar: string;
  duracion: string;
  fechas: string;
  numParticipantes: string;
  perfilPsicograficas: string;
  perfilConocimientos: string;
  perfilHabilidades: string;
  proposito: string;
  objetivoGeneral: ObjetivoGeneral;

  // 2. Objetivos particulares (dominios fijos)
  objCognitivo: ObjetivoParticular;
  objPsicomotor: ObjetivoParticular;
  objAfectivo: ObjetivoParticular;

  // 3. Requerimientos
  reqInstalaciones: string;
  reqEquipo: string;
  reqMateriales: string;
  reqHumanos: string;
  reqSeguridad: string;

  // 4. Evaluación
  evaluacionDescripcion: string;
  evaluacionCriterios: EvaluacionCriterio[];
  comprobacionRecursos: ComprobacionRecursos;

  // 5. Apertura o encuadre
  apertura: ActividadFila[];

  // 6. Desarrollo
  desarrollo: ActividadFila[];

  // 7. Cierre
  cierre: ActividadFila[];
};

function emptyObjetivoParticular(): ObjetivoParticular {
  return { sujeto: "El participante", accion: "", condicion: "", temas: "" };
}

function emptyActividadFila(): ActividadFila {
  return {
    id: crypto.randomUUID(),
    temaEtapa: "",
    actividades: "",
    duracionMin: null,
    tecnicas: "",
    material: "",
  };
}

function emptyCriterio(aspecto: string, momento: string): EvaluacionCriterio {
  return {
    id: crypto.randomUUID(),
    aspecto,
    porcentaje: "",
    instrumento: "Cuestionario",
    momento,
    tipo: "Heteroevaluación",
  };
}

/** Estado inicial del documento. Acepta valores precargados del curso (autocompletar). */
export function createEmptyCartaDescriptiva(prefill?: {
  nombreCurso?: string;
  nombreInstructor?: string;
  duracion?: string;
}): CartaDescriptivaData {
  return {
    nombreCurso: prefill?.nombreCurso ?? "",
    nombreInstructor: prefill?.nombreInstructor ?? "",
    lugar: "",
    duracion: prefill?.duracion ?? "",
    fechas: "",
    numParticipantes: "",
    perfilPsicograficas: "",
    perfilConocimientos: "",
    perfilHabilidades: "",
    proposito: "",
    objetivoGeneral: { sujeto: "El participante", accion: "", condicion: "" },
    objCognitivo: emptyObjetivoParticular(),
    objPsicomotor: emptyObjetivoParticular(),
    objAfectivo: emptyObjetivoParticular(),
    reqInstalaciones: "",
    reqEquipo: "",
    reqMateriales: "",
    reqHumanos: "",
    reqSeguridad: "",
    evaluacionDescripcion: "",
    evaluacionCriterios: [
      emptyCriterio("Evaluación diagnóstica", "Al inicio"),
      emptyCriterio("Evaluación formativa", "Intermedia"),
      emptyCriterio("Evaluación sumativa", "Al final"),
    ],
    comprobacionRecursos: {
      etapa: "Comprobación de la existencia y funcionamiento de los recursos requeridos",
      actividades: "",
      duracion: "",
      tecnicas: "",
      material: "Lista de verificación de requerimientos",
    },
    apertura: [emptyActividadFila()],
    desarrollo: [emptyActividadFila()],
    cierre: [emptyActividadFila()],
  };
}

export { emptyActividadFila, emptyCriterio };

/** Suma de minutos de una lista de filas (ignora valores nulos). */
export function sumDuracion(filas: ActividadFila[]): number {
  return filas.reduce((acc, fila) => acc + (fila.duracionMin ?? 0), 0);
}

/** Sumatoria total del documento (apertura + desarrollo + cierre) en minutos. */
export function sumDuracionTotal(data: CartaDescriptivaData): number {
  return (
    sumDuracion(data.apertura) +
    sumDuracion(data.desarrollo) +
    sumDuracion(data.cierre)
  );
}

/** Formatea minutos como "X min" o "Xh Ymin" para mostrar en UI/PDF. */
export function formatMinutos(min: number): string {
  if (min <= 0) return "0 min";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/**
 * Normaliza datos provenientes de BD (que pueden estar incompletos por cambios de versión),
 * fusionándolos con la estructura por defecto para evitar campos undefined en el formulario.
 */
export function hydrateCartaDescriptiva(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyCartaDescriptiva>[0],
): CartaDescriptivaData {
  const base = createEmptyCartaDescriptiva(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<CartaDescriptivaData>;

  const ensureRows = (rows: ActividadFila[] | undefined): ActividadFila[] => {
    if (!Array.isArray(rows) || rows.length === 0) return [emptyActividadFila()];
    return rows.map((r) => ({
      id: r.id || crypto.randomUUID(),
      temaEtapa: r.temaEtapa ?? "",
      actividades: r.actividades ?? "",
      duracionMin: typeof r.duracionMin === "number" ? r.duracionMin : null,
      tecnicas: r.tecnicas ?? "",
      material: r.material ?? "",
    }));
  };

  return {
    ...base,
    ...data,
    objetivoGeneral: { ...base.objetivoGeneral, ...data.objetivoGeneral },
    objCognitivo: { ...base.objCognitivo, ...data.objCognitivo },
    objPsicomotor: { ...base.objPsicomotor, ...data.objPsicomotor },
    objAfectivo: { ...base.objAfectivo, ...data.objAfectivo },
    comprobacionRecursos: { ...base.comprobacionRecursos, ...data.comprobacionRecursos },
    evaluacionCriterios:
      Array.isArray(data.evaluacionCriterios) && data.evaluacionCriterios.length > 0
        ? data.evaluacionCriterios.map((c) => ({
            id: c.id || crypto.randomUUID(),
            aspecto: c.aspecto ?? "",
            porcentaje: c.porcentaje ?? "",
            instrumento: c.instrumento ?? "",
            momento: c.momento ?? "",
            tipo: c.tipo ?? "",
          }))
        : base.evaluacionCriterios,
    apertura: ensureRows(data.apertura),
    desarrollo: ensureRows(data.desarrollo),
    cierre: ensureRows(data.cierre),
  };
}
