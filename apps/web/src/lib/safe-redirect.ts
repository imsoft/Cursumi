/**
 * Valida que una URL de redirección sea una ruta relativa segura del mismo origen.
 * Previene open redirect attacks como //evil.com o /\evil.com
 */
export function isSafeRedirect(url: string | undefined | null): url is string {
  if (!url || typeof url !== "string") return false;
  // Debe empezar con / pero NO con // ni /\ (protocolo relativo o UNC path)
  return url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\");
}

export function safeRedirectTarget(returnUrl: string | undefined | null, fallback = "/dashboard"): string {
  return isSafeRedirect(returnUrl) ? returnUrl : fallback;
}
