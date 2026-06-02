import { describe, it, expect } from "vitest";
import { isSafeRedirect, safeRedirectTarget } from "../safe-redirect";

describe("isSafeRedirect", () => {
  it("acepta rutas relativas válidas", () => {
    expect(isSafeRedirect("/dashboard")).toBe(true);
    expect(isSafeRedirect("/login?returnUrl=/dashboard")).toBe(true);
    expect(isSafeRedirect("/instructor/courses/123")).toBe(true);
  });

  it("rechaza protocolo relativo //evil.com", () => {
    expect(isSafeRedirect("//evil.com")).toBe(false);
  });

  it("rechaza UNC path /\\evil.com", () => {
    expect(isSafeRedirect("/\\evil.com")).toBe(false);
  });

  it("rechaza URLs absolutas", () => {
    expect(isSafeRedirect("https://evil.com")).toBe(false);
    expect(isSafeRedirect("http://evil.com/path")).toBe(false);
  });

  it("rechaza null y undefined", () => {
    expect(isSafeRedirect(null)).toBe(false);
    expect(isSafeRedirect(undefined)).toBe(false);
  });

  it("rechaza string vacío", () => {
    expect(isSafeRedirect("")).toBe(false);
  });

  it("rechaza rutas sin /", () => {
    expect(isSafeRedirect("dashboard")).toBe(false);
  });
});

describe("safeRedirectTarget", () => {
  it("retorna la URL si es segura", () => {
    expect(safeRedirectTarget("/dashboard")).toBe("/dashboard");
  });

  it("retorna el fallback para URLs inseguras", () => {
    expect(safeRedirectTarget("//evil.com")).toBe("/dashboard");
    expect(safeRedirectTarget("https://evil.com")).toBe("/dashboard");
  });

  it("retorna fallback personalizado", () => {
    expect(safeRedirectTarget(null, "/login")).toBe("/login");
    expect(safeRedirectTarget("//x.com", "/home")).toBe("/home");
  });

  it("retorna /dashboard por defecto cuando no hay URL", () => {
    expect(safeRedirectTarget(undefined)).toBe("/dashboard");
    expect(safeRedirectTarget(null)).toBe("/dashboard");
  });
});
