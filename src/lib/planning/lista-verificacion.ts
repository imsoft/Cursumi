/**
 * Tipos y utilidades de la "Lista de verificación de requerimientos".
 * Segundo documento de planeación didáctica.
 *
 * Se guarda en `CoursePlanningDocument.data` con `type = "lista-verificacion"`.
 */

export const LISTA_VERIFICACION_TYPE = "lista-verificacion" as const;

export type EstadoRequerimiento = "existe" | "no_existe" | "";

export type RequerimientoItem = {
  id: string;
  descripcion: string;
  estado: EstadoRequerimiento;
};

/** Categorías fijas del documento original (cada una con ítems repetibles). */
export type CategoriaKey =
  | "instalaciones"
  | "equipo"
  | "materiales"
  | "humanos"
  | "seguridad";

export const CATEGORIA_LABELS: Record<CategoriaKey, string> = {
  instalaciones: "Instalaciones, mobiliario y su distribución",
  equipo: "Equipo de apoyo",
  materiales: "Materiales didácticos de apoyo y servicios",
  humanos: "Requerimientos humanos",
  seguridad: "Medidas de salud / seguridad / higiene / protección civil",
};

export const CATEGORIA_ORDER: CategoriaKey[] = [
  "instalaciones",
  "equipo",
  "materiales",
  "humanos",
  "seguridad",
];

export type ListaVerificacionData = {
  // Encabezado
  nombreCurso: string;
  nombreInstructor: string;
  lugar: string;
  duracion: string;
  horario: string;
  fecha: string;
  // Categorías
  items: Record<CategoriaKey, RequerimientoItem[]>;
};

function emptyItem(): RequerimientoItem {
  return { id: crypto.randomUUID(), descripcion: "", estado: "" };
}

export function createEmptyListaVerificacion(prefill?: {
  nombreCurso?: string;
  nombreInstructor?: string;
  duracion?: string;
}): ListaVerificacionData {
  return {
    nombreCurso: prefill?.nombreCurso ?? "",
    nombreInstructor: prefill?.nombreInstructor ?? "",
    lugar: "",
    duracion: prefill?.duracion ?? "",
    horario: "",
    fecha: "",
    items: {
      instalaciones: [emptyItem()],
      equipo: [emptyItem()],
      materiales: [emptyItem()],
      humanos: [emptyItem()],
      seguridad: [emptyItem()],
    },
  };
}

export { emptyItem };

/** Total de ítems y cuántos están marcados como "existe". */
export function resumenVerificacion(data: ListaVerificacionData): { total: number; existen: number } {
  let total = 0;
  let existen = 0;
  for (const key of CATEGORIA_ORDER) {
    for (const item of data.items[key]) {
      if (!item.descripcion.trim()) continue;
      total += 1;
      if (item.estado === "existe") existen += 1;
    }
  }
  return { total, existen };
}

export function hydrateListaVerificacion(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyListaVerificacion>[0],
): ListaVerificacionData {
  const base = createEmptyListaVerificacion(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<ListaVerificacionData>;

  const ensureItems = (rows: RequerimientoItem[] | undefined): RequerimientoItem[] => {
    if (!Array.isArray(rows) || rows.length === 0) return [emptyItem()];
    return rows.map((r) => ({
      id: r.id || crypto.randomUUID(),
      descripcion: r.descripcion ?? "",
      estado: (["existe", "no_existe", ""].includes(r.estado as string) ? r.estado : "") as EstadoRequerimiento,
    }));
  };

  const rawItems = (data.items ?? {}) as Partial<Record<CategoriaKey, RequerimientoItem[]>>;

  return {
    ...base,
    ...data,
    items: {
      instalaciones: ensureItems(rawItems.instalaciones),
      equipo: ensureItems(rawItems.equipo),
      materiales: ensureItems(rawItems.materiales),
      humanos: ensureItems(rawItems.humanos),
      seguridad: ensureItems(rawItems.seguridad),
    },
  };
}
