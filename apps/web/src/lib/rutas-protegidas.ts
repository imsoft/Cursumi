/**
 * Qué rutas exigen sesión.
 *
 * El prefijo se compara respetando los límites de ruta. Con un `startsWith`
 * suelto, "/instructor" capturaba también "/instructors" y "/instructor-terms",
 * y "/business" capturaba la landing de empresas, el formulario de cotización y
 * la página para aceptar una invitación. Cinco páginas públicas acababan
 * redirigidas a /login: invisibles para Google pese a estar en el sitemap, e
 * inalcanzables para cualquiera que no hubiera iniciado sesión.
 *
 * Ojo con "/business": la landing es pública y lo privado cuelga de
 * "/business/dashboard", así que el prefijo protegido es ese, no "/business".
 */
export const RUTAS_PROTEGIDAS = [
  "/dashboard",
  "/instructor",
  "/admin",
  "/business/dashboard",
] as const;

export function esRutaProtegida(pathname: string): boolean {
  return RUTAS_PROTEGIDAS.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`),
  );
}
