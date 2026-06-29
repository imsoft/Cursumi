/**
 * @cursumi/shared — código compartido entre la web (Next.js) y la futura app móvil (Expo).
 *
 * REGLA DE ORO: este paquete es TypeScript puro. NO debe importar React, Next,
 * React Native ni Prisma. Solo tipos de dominio, esquemas de validación (Zod)
 * y helpers puros, para que ambos clientes consuman una única fuente de verdad.
 */

// ── Tipos de dominio ─────────────────────────────────────────────────────────

/** Tipo de curso: `virtual` = en video (on-demand) · `evento` = sesiones presenciales o por videollamada. */
export type CourseModality = "virtual" | "evento";
/** Formato de una sesión de un curso por evento. */
export type SessionFormat = "presencial" | "online";
export type CourseStatus = "draft" | "published" | "archived";
export type CourseType = "fechado" | "ondemand";
export type UserRole = "student" | "instructor" | "admin";

// ── Helpers puros ────────────────────────────────────────────────────────────

/**
 * Formatea un precio en pesos mexicanos. 0 = "Gratis".
 * Incluye el sufijo "MXN" explícito porque el público es de toda Latinoamérica
 * y el símbolo "$" por sí solo es ambiguo (pesos COL/ARG/CLP, dólares, etc.).
 * Ej.: `$1,234 MXN`.
 */
export function formatPriceMXN(price: number, showDecimals = false): string {
  if (price === 0) return "Gratis";
  const formatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(price);
  return `${formatted} MXN`;
}
