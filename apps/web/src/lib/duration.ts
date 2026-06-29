/**
 * Helpers para manejar la duración de cursos.
 *
 * La duración se almacena como un único `String` (campo `Course.duration`) con
 * el formato "N unidad" (p. ej. "8 horas", "1 hora", "3 semanas"). La UI la
 * captura con un número + un selector de unidad y aquí centralizamos el
 * parseo (para editar) y el formateo (para guardar y mostrar).
 */

export type DurationUnit = "minutos" | "horas" | "dias" | "semanas" | "meses";

interface DurationUnitConfig {
  /** Forma singular para mostrar cuando el valor es 1 (p. ej. "hora"). */
  singular: string;
  /** Forma plural, también el valor canónico guardado (p. ej. "horas"). */
  plural: string;
  /** Variantes que aceptamos al parsear datos existentes. */
  synonyms: string[];
}

const UNIT_CONFIG: Record<DurationUnit, DurationUnitConfig> = {
  minutos: { singular: "minuto", plural: "minutos", synonyms: ["minuto", "minutos", "min", "mins", "m"] },
  horas: { singular: "hora", plural: "horas", synonyms: ["hora", "horas", "hr", "hrs", "h"] },
  dias: { singular: "día", plural: "días", synonyms: ["dia", "dias", "día", "días", "d"] },
  semanas: { singular: "semana", plural: "semanas", synonyms: ["semana", "semanas"] },
  meses: { singular: "mes", plural: "meses", synonyms: ["mes", "meses"] },
};

export const DEFAULT_DURATION_UNIT: DurationUnit = "horas";

/** Opciones para el `<Select>` de unidad. */
export const DURATION_UNIT_OPTIONS: { value: DurationUnit; label: string }[] = (
  Object.keys(UNIT_CONFIG) as DurationUnit[]
).map((unit) => ({ value: unit, label: UNIT_CONFIG[unit].plural }));

/** Quita acentos y normaliza para comparar texto de unidades. */
const normalize = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

/**
 * Parsea un string de duración existente en { value, unit }.
 * Acepta datos heredados como "3", "8 horas", "120 min", "2 hrs".
 * Si no encuentra unidad reconocible, usa la unidad por defecto.
 */
export const parseDuration = (
  raw: string | null | undefined,
): { value: string; unit: DurationUnit } => {
  if (!raw) return { value: "", unit: DEFAULT_DURATION_UNIT };

  const match = raw.match(/(\d+(?:[.,]\d+)?)/);
  const value = match ? match[1].replace(",", ".") : "";

  // Primer token alfabético tras el número (p. ej. "min", "horas", "mes").
  const unitToken = normalize(raw.replace(/\d+(?:[.,]\d+)?/, "")).split(/\s+/)[0] ?? "";
  let unit: DurationUnit = DEFAULT_DURATION_UNIT;
  if (unitToken) {
    for (const key of Object.keys(UNIT_CONFIG) as DurationUnit[]) {
      if (UNIT_CONFIG[key].synonyms.some((syn) => normalize(syn) === unitToken)) {
        unit = key;
        break;
      }
    }
  }

  return { value, unit };
};

/**
 * Formatea un valor + unidad en el string canónico que se guarda y muestra.
 * Maneja singular/plural ("1 hora" vs "8 horas"). Devuelve "" si no hay valor.
 */
export const formatDuration = (
  value: string | number,
  unit: DurationUnit,
): string => {
  const str = String(value).trim();
  if (!str) return "";
  const num = Number(str.replace(",", "."));
  const config = UNIT_CONFIG[unit] ?? UNIT_CONFIG[DEFAULT_DURATION_UNIT];
  const word = num === 1 ? config.singular : config.plural;
  return `${str} ${word}`;
};

/**
 * Normaliza una duración almacenada para mostrarla con unidad.
 * Datos nuevos ya vienen como "8 horas" (idempotente). Datos heredados como
 * "3" se muestran con la unidad por defecto ("3 horas"). Si el texto no tiene
 * número (p. ej. texto libre), se devuelve tal cual para no perder información.
 */
export const displayDuration = (raw: string | null | undefined): string => {
  if (!raw) return "";
  const { value, unit } = parseDuration(raw);
  if (!value) return raw;
  return formatDuration(value, unit);
};
