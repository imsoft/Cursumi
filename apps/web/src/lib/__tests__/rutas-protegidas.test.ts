import { describe, it, expect } from "vitest";
import { esRutaProtegida } from "@/lib/rutas-protegidas";

/**
 * Regresión: el proxy comparaba prefijos con un startsWith suelto, así que
 * "/instructor" capturaba "/instructors" y "/business" capturaba la landing de
 * empresas. Cinco páginas públicas redirigían a /login.
 */

describe("esRutaProtegida", () => {
  it("protege las áreas privadas y lo que cuelga de ellas", () => {
    for (const ruta of [
      "/dashboard",
      "/dashboard/my-courses",
      "/instructor",
      "/instructor/courses/abc/edit",
      "/admin",
      "/admin/finances",
      "/business/dashboard",
      "/business/dashboard/employees",
    ]) {
      expect(esRutaProtegida(ruta), ruta).toBe(true);
    }
  });

  it("deja pasar las públicas que comparten prefijo", () => {
    for (const ruta of [
      "/instructors", // listado público de instructores
      "/instructor-terms", // términos para instructores
      "/business", // landing de empresas
      "/business/cotizacion", // formulario de cotización
      "/business/invite/abc123", // aceptar invitación, sin sesión todavía
    ]) {
      expect(esRutaProtegida(ruta), ruta).toBe(false);
    }
  });

  it("deja pasar el resto del sitio público", () => {
    for (const ruta of ["/", "/courses", "/courses/algo", "/blog", "/login", "/pricing"]) {
      expect(esRutaProtegida(ruta), ruta).toBe(false);
    }
  });

  it("no se deja engañar por un prefijo parecido", () => {
    expect(esRutaProtegida("/administracion")).toBe(false);
    expect(esRutaProtegida("/dashboards")).toBe(false);
  });
});
