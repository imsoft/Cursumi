import { describe, it, expect } from "vitest";
import { claveMes, ultimosMeses } from "@/lib/fecha";

/**
 * Las series mensuales de ingresos se agrupaban con la hora del servidor, que
 * en Vercel es UTC. Una compra de la tarde del último día del mes en México
 * caía ya en el mes siguiente.
 */

describe("claveMes", () => {
  it("usa el mes de México, no el de UTC", () => {
    // 1 de octubre a las 02:00 UTC son las 20:00 del 30 de septiembre en México.
    expect(claveMes(new Date("2026-10-01T02:00:00Z"))).toBe("2026-09");
  });

  it("una fecha a mediodía cae en su mes natural", () => {
    expect(claveMes(new Date("2026-09-15T18:00:00Z"))).toBe("2026-09");
  });

  it("también corrige el cambio de año", () => {
    // 1 de enero a las 03:00 UTC son las 21:00 del 31 de diciembre en México.
    expect(claveMes(new Date("2027-01-01T03:00:00Z"))).toBe("2026-12");
  });
});

describe("ultimosMeses", () => {
  it("devuelve n meses, del más antiguo al más reciente", () => {
    const meses = ultimosMeses(3, new Date("2026-01-15T18:00:00Z"));
    expect(meses.map((m) => m.clave)).toEqual(["2025-11", "2025-12", "2026-01"]);
  });

  it("cruza el cambio de año hacia atrás", () => {
    const meses = ultimosMeses(2, new Date("2026-01-05T18:00:00Z"));
    expect(meses.map((m) => m.clave)).toEqual(["2025-12", "2026-01"]);
  });

  it("etiqueta los meses en español abreviado", () => {
    const meses = ultimosMeses(1, new Date("2026-09-15T18:00:00Z"));
    expect(meses[0].etiqueta).toBe("sep");
  });

  it("el último mes de la serie es el mes en curso en México", () => {
    // Última hora del 30 de septiembre en México, ya 1 de octubre en UTC.
    const meses = ultimosMeses(6, new Date("2026-10-01T02:00:00Z"));
    expect(meses[meses.length - 1].clave).toBe("2026-09");
    expect(meses).toHaveLength(6);
  });
});
