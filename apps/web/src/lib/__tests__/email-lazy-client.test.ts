import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";

/**
 * Regresión: el cliente de Resend se creaba al cargar el módulo, así que si
 * RESEND_API_KEY faltaba, el import lanzaba y —como medio proyecto importa
 * este módulo— la app entera respondía 500 en vez de fallar solo el correo.
 */

const original = process.env.RESEND_API_KEY;

describe("cliente de correo perezoso", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterAll(() => {
    if (original === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = original;
  });

  it("se puede importar sin RESEND_API_KEY (antes tumbaba la app)", async () => {
    delete process.env.RESEND_API_KEY;
    await expect(import("@/lib/email")).resolves.toBeDefined();
  });

  it("sin clave, enviar un correo no lanza: simplemente no se envía", async () => {
    delete process.env.RESEND_API_KEY;
    const { sendEnrollmentEmail } = await import("@/lib/email");
    await expect(
      sendEnrollmentEmail({
        to: "alguien@ejemplo.com",
        name: "Ana",
        courseTitle: "Curso",
        courseUrl: "https://cursumi.com/x",
      }),
    ).resolves.not.toThrow();
  });

  it("con la clave vacía tampoco lanza al importar", async () => {
    process.env.RESEND_API_KEY = "";
    await expect(import("@/lib/email")).resolves.toBeDefined();
  });
});
