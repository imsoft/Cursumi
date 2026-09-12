import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses a duration string like "1h30m", "45m", "2h", "90" (minutes assumed) → total minutes
 */
export function parseDurationToMinutes(duration: string | null | undefined): number {
  if (!duration) return 0;
  const lower = duration.toLowerCase().trim();
  let total = 0;
  const hours = lower.match(/(\d+)\s*h/);
  const mins = lower.match(/(\d+)\s*m/);
  if (hours) total += parseInt(hours[1]) * 60;
  if (mins) total += parseInt(mins[1]);
  // If only digits, assume minutes
  if (!hours && !mins) {
    const num = parseInt(lower, 10);
    if (!isNaN(num)) total = num;
  }
  return total;
}

/**
 * Formatea un precio en formato de moneda mexicana (MXN)
 * @param price - Precio numérico a formatear
 * @param showDecimals - Si se deben mostrar decimales (default: false)
 * @returns String formateado como "$1,234.56" o "$1,234"
 */
/** Entidades que el editor de texto enriquecido produce de verdad. */
const ENTIDADES_HTML: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

/** Quita las etiquetas HTML y devuelve texto plano. */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    // Las entidades se decodifican DESPUÉS de quitar etiquetas. Al revés, un
    // "&lt;b&gt;" escrito por el usuario se convertiría en etiqueta real y el
    // paso anterior se lo comería.
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;|&apos;/g, (e) => ENTIDADES_HTML[e] ?? e)
    .trim();
}

/**
 * Texto plano de una sola línea para la descripción de un enlace compartido.
 *
 * La descripción de un curso se escribe con editor enriquecido, así que viene
 * como HTML. Al mandarla tal cual a las etiquetas Open Graph, WhatsApp pintaba
 * las etiquetas literales en la tarjeta del mensaje.
 *
 * Además de limpiar, colapsa los saltos de línea que dejan los párrafos y
 * recorta por palabra completa: unos 160 caracteres es lo que muestran los
 * buscadores, y WhatsApp enseña todavía menos.
 */
export function metaDescription(
  html: string | null | undefined,
  maxLength: number = 160,
): string {
  const texto = stripHtml(html).replace(/\s+/g, " ").trim();
  if (texto.length <= maxLength) return texto;
  const recortado = texto.slice(0, maxLength);
  const ultimoEspacio = recortado.lastIndexOf(" ");
  const base = ultimoEspacio > maxLength * 0.6 ? recortado.slice(0, ultimoEspacio) : recortado;
  return `${base.trimEnd()}…`;
}

// formatPriceMXN ahora vive en el paquete compartido (@cursumi/shared) para que
// la web y la futura app móvil usen exactamente la misma implementación.
export { formatPriceMXN } from "@cursumi/shared";

/** Primer nombre para saludos (ej. "María López" → "María"). */
export function firstNameFromFullName(name: string | null | undefined): string {
  const t = name?.trim();
  if (!t) return "Usuario";
  return t.split(/\s+/)[0] ?? "Usuario";
}
