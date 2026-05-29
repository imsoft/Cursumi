/**
 * Tipos y utilidades de la "Guía de actividades de aprendizaje de cada unidad
 * del curso": encabezado con el curso + una tabla por unidad de aprendizaje,
 * cada una con sus datos generales y una tabla de actividades.
 */

export const GUIA_ACTIVIDADES_TYPE = "guia-actividades" as const;

export type ActividadUnidad = {
  id: string;
  titulo: string;
  instrucciones: string;
  materiales: string;
  participacion: string;
  medioTiempo: string;
  ponderacion: string;
};

export type CriteriosEvaluacion = {
  conocimientos: boolean;
  habilidades: boolean;
  actitudes: boolean;
};

export type UnidadAprendizaje = {
  id: string;
  nombre: string;
  objetivo: string;
  periodo: string;
  ponderacionGeneral: string;
  criterios: CriteriosEvaluacion;
  actividades: ActividadUnidad[];
};

export type GuiaActividadesData = {
  nombreCurso: string;
  unidades: UnidadAprendizaje[];
};

const MATERIALES_DEFAULT = "Acceso a internet\nAcceso a la plataforma educativa\nEstar registrado en la plataforma.";

export function emptyActividad(): ActividadUnidad {
  return {
    id: crypto.randomUUID(),
    titulo: "",
    instrucciones: "",
    materiales: MATERIALES_DEFAULT,
    participacion: "Individual",
    medioTiempo: "",
    ponderacion: "",
  };
}

export function emptyUnidad(): UnidadAprendizaje {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    objetivo: "",
    periodo: "Indefinido",
    ponderacionGeneral: "",
    criterios: { conocimientos: false, habilidades: false, actitudes: false },
    actividades: [emptyActividad()],
  };
}

export function createEmptyGuiaActividades(prefill?: { nombreCurso?: string }): GuiaActividadesData {
  return {
    nombreCurso: prefill?.nombreCurso ?? "",
    unidades: [emptyUnidad()],
  };
}

export function hydrateGuiaActividades(raw: unknown, prefill?: { nombreCurso?: string }): GuiaActividadesData {
  const base = createEmptyGuiaActividades(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<GuiaActividadesData>;

  const unidades =
    Array.isArray(data.unidades) && data.unidades.length > 0
      ? data.unidades.map((u) => ({
          id: u.id || crypto.randomUUID(),
          nombre: u.nombre ?? "",
          objetivo: u.objetivo ?? "",
          periodo: u.periodo ?? "Indefinido",
          ponderacionGeneral: u.ponderacionGeneral ?? "",
          criterios: {
            conocimientos: Boolean(u.criterios?.conocimientos),
            habilidades: Boolean(u.criterios?.habilidades),
            actitudes: Boolean(u.criterios?.actitudes),
          },
          actividades:
            Array.isArray(u.actividades) && u.actividades.length > 0
              ? u.actividades.map((a) => ({
                  id: a.id || crypto.randomUUID(),
                  titulo: a.titulo ?? "",
                  instrucciones: a.instrucciones ?? "",
                  materiales: a.materiales ?? "",
                  participacion: a.participacion ?? "",
                  medioTiempo: a.medioTiempo ?? "",
                  ponderacion: a.ponderacion ?? "",
                }))
              : [emptyActividad()],
        }))
      : base.unidades;

  return { ...base, ...data, unidades };
}
