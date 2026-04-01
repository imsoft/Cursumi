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
/** Strips HTML tags and returns plain text. Useful for cards with line-clamp. */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

export function formatPriceMXN(price: number, showDecimals: boolean = false): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(price)
}

/** Primer nombre para saludos (ej. "María López" → "María"). */
export function firstNameFromFullName(name: string | null | undefined): string {
  const t = name?.trim();
  if (!t) return "Usuario";
  return t.split(/\s+/)[0] ?? "Usuario";
}
