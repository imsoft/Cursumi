export const MODALITY_CONFIG = {
  virtual: {
    label: "Curso en video",
    shortLabel: "Video",
    color: {
      bg: "bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-500/20",
      badgeBg: "bg-blue-500",
      accent: "from-blue-500/8 to-blue-600/8",
      ring: "ring-blue-500/30",
      leftBorder: "border-l-blue-500",
    },
    description: "Contenido bajo demanda: vídeos, textos y actividades que el alumno ve a su ritmo.",
  },
  evento: {
    label: "Curso por evento",
    shortLabel: "Evento",
    color: {
      bg: "bg-violet-500/10",
      text: "text-violet-600 dark:text-violet-400",
      border: "border-violet-500/20",
      badgeBg: "bg-violet-500",
      accent: "from-violet-500/8 to-violet-600/8",
      ring: "ring-violet-500/30",
      leftBorder: "border-l-violet-500",
    },
    description: "Sesiones con fecha y hora. Cada sesión puede ser presencial o por videollamada.",
  },
} as const;

export type Modality = keyof typeof MODALITY_CONFIG;

/**
 * Normaliza valores de modalidad (incluye legacy presencial/live) a las dos
 * modalidades vigentes. Cualquier cosa que no sea "virtual" se considera evento.
 */
export function normalizeModality(modality: string): Modality {
  return modality === "virtual" ? "virtual" : "evento";
}

/** Configuración del formato de una sesión de un curso por evento. */
export const SESSION_FORMAT_CONFIG = {
  presencial: {
    label: "Presencial",
    description: "Los estudiantes asisten físicamente a una sede.",
  },
  online: {
    label: "Videollamada",
    description: "Sesión en línea con enlace de Meet, Zoom u otra videollamada.",
  },
} as const;

export type SessionFormat = keyof typeof SESSION_FORMAT_CONFIG;

/** Normaliza el formato de sesión (legacy live -> online). */
export function normalizeSessionFormat(format: string): SessionFormat {
  return format === "online" || format === "live" ? "online" : "presencial";
}
