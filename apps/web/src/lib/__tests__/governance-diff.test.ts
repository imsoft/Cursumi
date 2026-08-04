import { describe, it, expect } from "vitest";
import { compararVersiones, type GovernanceContent } from "@/lib/governance";

const contenido = (intro: string, respuestas: Record<string, string>): GovernanceContent => ({
  intro,
  sections: [
    {
      id: "s1",
      tag: "Dinero",
      title: "Reparto",
      questions: Object.entries(respuestas).map(([id, answer]) => ({
        id,
        q: `Pregunta ${id}`,
        answer,
      })),
    },
  ],
});

describe("compararVersiones", () => {
  it("la primera versión no marca nada como cambiado", () => {
    const c = compararVersiones(contenido("hola", { a: "1" }), null);
    expect(c.modificadas.size).toBe(0);
    expect(c.nuevas.size).toBe(0);
    expect(c.introCambio).toBe(false);
  });

  it("detecta un acuerdo modificado", () => {
    const c = compararVersiones(
      contenido("x", { a: "50/50", b: "sin cambio" }),
      contenido("x", { a: "60/40", b: "sin cambio" }),
    );
    expect([...c.modificadas]).toEqual(["a"]);
    expect(c.nuevas.size).toBe(0);
  });

  it("detecta una pregunta nueva", () => {
    const c = compararVersiones(contenido("x", { a: "1", b: "2" }), contenido("x", { a: "1" }));
    expect([...c.nuevas]).toEqual(["b"]);
    expect(c.modificadas.size).toBe(0);
  });

  it("detecta una pregunta eliminada", () => {
    const c = compararVersiones(contenido("x", { a: "1" }), contenido("x", { a: "1", b: "2" }));
    expect(c.eliminadas).toEqual(["Pregunta b"]);
  });

  it("detecta cambio en la introducción", () => {
    const c = compararVersiones(contenido("nueva", { a: "1" }), contenido("vieja", { a: "1" }));
    expect(c.introCambio).toBe(true);
  });

  it("ignora diferencias de espacios en blanco", () => {
    const c = compararVersiones(
      contenido("  x  ", { a: "  50/50  " }),
      contenido("x", { a: "50/50" }),
    );
    expect(c.modificadas.size).toBe(0);
    expect(c.introCambio).toBe(false);
  });
});
