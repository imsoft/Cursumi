import { describe, it, expect } from "vitest";
import { formatDateLongMX, formatDateShortMX } from "../date-format";

describe("formatDateLongMX", () => {
  it("formatea una fecha con día de semana en español", () => {
    const date = new Date("2026-04-13T00:00:00Z");
    const result = formatDateLongMX(date);
    expect(result).toMatch(/lunes/i);
    expect(result).toMatch(/13/);
    expect(result).toMatch(/abril/i);
    expect(result).toMatch(/2026/);
  });

  it("formatea correctamente el primer día del año", () => {
    const date = new Date("2026-01-01T00:00:00Z");
    const result = formatDateLongMX(date);
    expect(result).toMatch(/enero/i);
    expect(result).toMatch(/2026/);
  });

  it("formatea correctamente el último día del año", () => {
    const date = new Date("2026-12-31T00:00:00Z");
    const result = formatDateLongMX(date);
    expect(result).toMatch(/diciembre/i);
    expect(result).toMatch(/31/);
  });
});

describe("formatDateShortMX", () => {
  it("formatea una fecha corta en español", () => {
    const date = new Date("2026-04-13T00:00:00Z");
    const result = formatDateShortMX(date);
    expect(result).toMatch(/13/);
    expect(result).toMatch(/abr/i);
    expect(result).toMatch(/2026/);
  });

  it("no incluye el día de la semana", () => {
    const date = new Date("2026-04-13T00:00:00Z");
    const result = formatDateShortMX(date);
    expect(result).not.toMatch(/lunes/i);
  });
});
