import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * El segundo factor se comprobaba solo en los layouts de /admin e /instructor,
 * que es una puerta de la interfaz: con la cookie de sesión se podía llamar a
 * la API directamente. Ahora requireRole lo exige, y por ahí pasan las 42
 * rutas privilegiadas.
 */

let rolActual = "student";
let faltaSegundoFactor = false;

vi.mock("@/lib/user-service", () => ({
  getUserRole: vi.fn(async () => rolActual),
}));
vi.mock("@/lib/two-factor-guard", () => ({
  // El propio guard ya decide si el rol lo exige y si la cuenta está exenta
  // por entrar solo con Google; aquí se simula su veredicto.
  debeConfigurar2FA: vi.fn(async () => faltaSegundoFactor),
}));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));

const { requireRole, ApiError } = await import("@/lib/api-helpers");

beforeEach(() => {
  rolActual = "student";
  faltaSegundoFactor = false;
});

describe("requireRole", () => {
  it("deja pasar a un admin que ya tiene segundo factor", async () => {
    rolActual = "admin";
    await expect(requireRole("u1", ["admin"])).resolves.toBe("admin");
  });

  it("bloquea a un admin sin segundo factor", async () => {
    rolActual = "admin";
    faltaSegundoFactor = true;
    await expect(requireRole("u1", ["admin"])).rejects.toBeInstanceOf(ApiError);
    await expect(requireRole("u1", ["admin"])).rejects.toMatchObject({ status: 403 });
  });

  it("bloquea también a un instructor sin segundo factor", async () => {
    rolActual = "instructor";
    faltaSegundoFactor = true;
    await expect(requireRole("u1", ["instructor", "admin"])).rejects.toMatchObject({
      status: 403,
    });
  });

  it("el mensaje dice dónde activarlo, para no dejar a nadie atascado", async () => {
    rolActual = "admin";
    faltaSegundoFactor = true;
    await expect(requireRole("u1", ["admin"])).rejects.toThrow(/seguridad\/dos-factores/);
  });

  it("no le pide segundo factor a quien no lo tiene obligatorio", async () => {
    rolActual = "student";
    await expect(requireRole("u1", ["student"])).resolves.toBe("student");
  });

  it("el rol equivocado se rechaza antes de mirar el segundo factor", async () => {
    rolActual = "student";
    faltaSegundoFactor = true;
    await expect(requireRole("u1", ["admin"])).rejects.toThrow("No autorizado");
  });
});
