/** Fecha larga en español (México), p. ej. "7 de marzo de 2026" */
export function formatDateLongMX(date: Date): string {
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Fecha corta (solo día/mes/año) */
export function formatDateShortMX(date: Date): string {
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}
