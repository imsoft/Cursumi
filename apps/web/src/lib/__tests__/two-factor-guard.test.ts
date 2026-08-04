import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Regresión: el guardia de 2FA NO debe dejar fuera a quien entra con Google.
 *
 * El alta del TOTP pide la contraseña para generar el QR. Quien se registró con
 * un proveedor externo no tiene ninguna, así que exigirle 2FA lo deja sin
 * salida: no puede activarlo y tampoco entrar a su panel. Pasó en producción
 * con las tres cuentas con privilegios.
 */

let usuario: { twoFactorEnabled: boolean } | null = null;
let cuentaConContrasena: { id: string } | null = null;

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(async () => usuario) },
    account: { findFirst: vi.fn(async () => cuentaConContrasena) },
  },
}));

const { debeConfigurar2FA, rolExige2FA } = await import("@/lib/two-factor-guard");

describe("rolExige2FA", () => {
  it("aplica a admin e instructor", () => {
    expect(rolExige2FA("admin")).toBe(true);
    expect(rolExige2FA("instructor")).toBe(true);
  });

  it("no aplica a estudiantes", () => {
    expect(rolExige2FA("student")).toBe(false);
  });
});

describe("debeConfigurar2FA", () => {
  beforeEach(() => {
    usuario = { twoFactorEnabled: false };
    cuentaConContrasena = { id: "cuenta-1" };
  });

  it("lo exige a un admin con contraseña y sin 2FA", async () => {
    await expect(debeConfigurar2FA("u1", "admin")).resolves.toBe(true);
  });

  it("NO lo exige a quien solo entra con Google (no podría activarlo)", async () => {
    cuentaConContrasena = null;
    await expect(debeConfigurar2FA("u1", "admin")).resolves.toBe(false);
    await expect(debeConfigurar2FA("u1", "instructor")).resolves.toBe(false);
  });

  it("no lo exige si ya lo tiene activado", async () => {
    usuario = { twoFactorEnabled: true };
    await expect(debeConfigurar2FA("u1", "admin")).resolves.toBe(false);
  });

  it("no lo exige a un estudiante", async () => {
    await expect(debeConfigurar2FA("u1", "student")).resolves.toBe(false);
  });
});
