/**
 * Rutas internas que la app móvil puede abrir dentro de su visor web con
 * sesión (`/api/mobile/planning-bridge?redirect=…`). Solo rutas relativas y de
 * las áreas con sesión: evita que el parámetro se use como open-redirect.
 */
const ALLOWED = /^\/(?:instructor|admin|dashboard|business)(?:\/[^?#]*)?(?:\?[^#]*)?$|^\/gobernanza(?:\?[^#]*)?$/;

export const BRIDGE_FALLBACK_PATH = "/dashboard";

export function safeBridgePath(requested: string | null | undefined): string {
  const path = (requested ?? "").trim();
  // "//evil.com" y "/\evil.com" los trata el navegador como URL absoluta.
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return BRIDGE_FALLBACK_PATH;
  return ALLOWED.test(path) ? path : BRIDGE_FALLBACK_PATH;
}
