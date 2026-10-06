import { describe, it, expect } from "vitest";
import { safeBridgePath } from "@/lib/native-bridge";

describe("safeBridgePath (visor web de la app móvil)", () => {
  it("acepta las áreas con sesión que abre la app", () => {
    for (const p of [
      "/instructor/courses/abc/planning",
      "/instructor/blog",
      "/admin/ai-lab",
      "/admin/blog",
      "/dashboard/business",
      "/business/dashboard",
      "/business/dashboard/teams/t1",
      "/gobernanza",
      "/instructor/courses/abc/planning?tab=2",
    ]) expect(safeBridgePath(p), p).toBe(p);
  });

  it("rechaza open-redirect, rutas públicas y basura", () => {
    for (const p of ["//evil.com", "/\\evil.com", "https://evil.com/admin", "/login", "/api/auth/sign-out", "", null, undefined, "/gobernanzas", "/instructorx", "/admin#x"]) {
      expect(safeBridgePath(p as string), String(p)).toBe("/dashboard");
    }
  });
});
