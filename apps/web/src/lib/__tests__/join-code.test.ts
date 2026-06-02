import { describe, it, expect } from "vitest";
import { shouldUseFreeJoinCode, hashJoinCode, verifyJoinCode } from "../join-code";

// ─── shouldUseFreeJoinCode ────────────────────────────────────────────────────

describe("shouldUseFreeJoinCode", () => {
  it("retorna true para cursos presenciales gratuitos", () => {
    expect(shouldUseFreeJoinCode("presencial", 0)).toBe(true);
  });

  it("retorna true para cursos en vivo gratuitos", () => {
    expect(shouldUseFreeJoinCode("live", 0)).toBe(true);
  });

  it("retorna false para cursos virtuales aunque sean gratuitos", () => {
    expect(shouldUseFreeJoinCode("virtual", 0)).toBe(false);
  });

  it("retorna false para cursos presenciales con precio > 0", () => {
    expect(shouldUseFreeJoinCode("presencial", 100)).toBe(false);
  });

  it("retorna false para cursos en vivo con precio > 0", () => {
    expect(shouldUseFreeJoinCode("live", 500)).toBe(false);
  });

  it("retorna false para modality desconocida", () => {
    expect(shouldUseFreeJoinCode("unknown", 0)).toBe(false);
  });
});

// ─── hashJoinCode / verifyJoinCode ────────────────────────────────────────────

describe("hashJoinCode + verifyJoinCode", () => {
  it("verifica correctamente el hash del código original", async () => {
    const plain = "ABC123";
    const hash = await hashJoinCode(plain);
    const result = await verifyJoinCode(plain, hash);
    expect(result).toBe(true);
  });

  it("rechaza un código incorrecto", async () => {
    const hash = await hashJoinCode("ABC123");
    const result = await verifyJoinCode("WRONG", hash);
    expect(result).toBe(false);
  });

  it("cada hash generado es único (salt aleatorio)", async () => {
    const h1 = await hashJoinCode("MISMO");
    const h2 = await hashJoinCode("MISMO");
    expect(h1).not.toBe(h2);
    // pero ambos verifican contra el mismo código
    expect(await verifyJoinCode("MISMO", h1)).toBe(true);
    expect(await verifyJoinCode("MISMO", h2)).toBe(true);
  });

  it("rechaza código vacío contra hash válido", async () => {
    const hash = await hashJoinCode("XYZ");
    expect(await verifyJoinCode("", hash)).toBe(false);
  });

  it("retorna false para stored=null", async () => {
    expect(await verifyJoinCode("ABC", null)).toBe(false);
  });

  it("retorna false para hash con formato incorrecto (sin prefijo)", async () => {
    expect(await verifyJoinCode("ABC", "notascrypt$hash")).toBe(false);
  });

  it("retorna false para hash corrupto", async () => {
    expect(await verifyJoinCode("ABC", "scrypt$invalidsalt$zzz")).toBe(false);
  });

  it("el hash empieza con el prefijo scrypt$", async () => {
    const hash = await hashJoinCode("TEST");
    expect(hash.startsWith("scrypt$")).toBe(true);
  });
});
