/**
 * Tipos y utilidades del "Manual del participante": portada + tabla de contenido
 * autogenerada + secciones de texto (con dos niveles de jerarquía) + bibliografía.
 */

export const MANUAL_PARTICIPANTE_TYPE = "manual-participante" as const;

export type NivelSeccion = 1 | 2;

export type SeccionManual = {
  id: string;
  nivel: NivelSeccion;
  titulo: string;
  cuerpo: string;
};

export type ManualParticipanteData = {
  nombreCurso: string;
  estandarReferencia: string;
  mostrarContenido: boolean;
  secciones: SeccionManual[];
  bibliografia: string[];
};

export function emptySeccionManual(nivel: NivelSeccion = 1): SeccionManual {
  return { id: crypto.randomUUID(), nivel, titulo: "", cuerpo: "" };
}

function seccion(nivel: NivelSeccion, titulo: string): SeccionManual {
  return { id: crypto.randomUUID(), nivel, titulo, cuerpo: "" };
}

function seccionesPorDefecto(): SeccionManual[] {
  return [
    seccion(1, "Presentación"),
    seccion(2, "Bienvenida"),
    seccion(2, "Recomendaciones de la forma de utilizar el manual"),
    seccion(2, "Otras recomendaciones para el estudio"),
    seccion(2, "Esquema de las unidades"),
    seccion(2, "Objetivo general"),
    seccion(1, "Introducción"),
    seccion(1, "Fundamentos"),
    seccion(1, "Desarrollo"),
  ];
}

export function createEmptyManualParticipante(prefill?: { nombreCurso?: string }): ManualParticipanteData {
  return {
    nombreCurso: prefill?.nombreCurso ?? "",
    estandarReferencia: "",
    mostrarContenido: true,
    secciones: seccionesPorDefecto(),
    bibliografia: [""],
  };
}

export function hydrateManualParticipante(raw: unknown, prefill?: { nombreCurso?: string }): ManualParticipanteData {
  const base = createEmptyManualParticipante(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<ManualParticipanteData>;

  const secciones =
    Array.isArray(data.secciones) && data.secciones.length > 0
      ? data.secciones.map((s) => ({
          id: s.id || crypto.randomUUID(),
          nivel: (s.nivel === 2 ? 2 : 1) as NivelSeccion,
          titulo: s.titulo ?? "",
          cuerpo: s.cuerpo ?? "",
        }))
      : base.secciones;

  const bibliografia =
    Array.isArray(data.bibliografia) && data.bibliografia.length > 0 ? data.bibliografia.map((b) => b ?? "") : base.bibliografia;

  return {
    ...base,
    ...data,
    mostrarContenido: data.mostrarContenido ?? base.mostrarContenido,
    secciones,
    bibliografia,
  };
}
