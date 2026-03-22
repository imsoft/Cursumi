export const MODALITY_CONFIG = {
  virtual: {
    label: "Curso Virtual",
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
    description: "Los estudiantes acceden al contenido desde cualquier lugar.",
  },
  presencial: {
    label: "Curso Presencial",
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
    description: "Los estudiantes asisten físicamente a las sesiones.",
  },
} as const;

export type Modality = keyof typeof MODALITY_CONFIG;
