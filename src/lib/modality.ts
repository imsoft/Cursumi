export const MODALITY_CONFIG = {
  virtual: {
    label: "Curso virtual (vídeo)",
    shortLabel: "Virtual",
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
  live: {
    label: "Clase en vivo (enlace)",
    shortLabel: "En vivo",
    color: {
      bg: "bg-violet-500/10",
      text: "text-violet-600 dark:text-violet-400",
      border: "border-violet-500/20",
      badgeBg: "bg-violet-500",
      accent: "from-violet-500/8 to-violet-600/8",
      ring: "ring-violet-500/30",
      leftBorder: "border-l-violet-500",
    },
    description: "Sesiones en fecha y hora con enlace de Meet, Zoom u otra videollamada.",
  },
  presencial: {
    label: "Curso presencial",
    shortLabel: "Presencial",
    color: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/20",
      badgeBg: "bg-emerald-500",
      accent: "from-emerald-500/8 to-emerald-600/8",
      ring: "ring-emerald-500/30",
      leftBorder: "border-l-emerald-500",
    },
    description: "Los estudiantes asisten físicamente a sede y horario definidos.",
  },
} as const;

export type Modality = keyof typeof MODALITY_CONFIG;
