import { describe, it, expect } from "vitest";
import {
  parseDurationToMinutes,
  formatPriceMXN,
  firstNameFromFullName,
  stripHtml,
} from "../utils";

describe("parseDurationToMinutes", () => {
  it("parsea formato 1h30m", () => expect(parseDurationToMinutes("1h30m")).toBe(90));
  it("parsea solo horas: 2h", () => expect(parseDurationToMinutes("2h")).toBe(120));
  it("parsea solo minutos: 45m", () => expect(parseDurationToMinutes("45m")).toBe(45));
  it("parsea número solo como minutos: '90'", () => expect(parseDurationToMinutes("90")).toBe(90));
  it("retorna 0 para null", () => expect(parseDurationToMinutes(null)).toBe(0));
  it("retorna 0 para undefined", () => expect(parseDurationToMinutes(undefined)).toBe(0));
  it("retorna 0 para string vacío", () => expect(parseDurationToMinutes("")).toBe(0));
  it("es case-insensitive: 1H 30M", () => expect(parseDurationToMinutes("1H 30M")).toBe(90));
});

describe("formatPriceMXN", () => {
  it("formatea precios en MXN sin decimales", () => {
    expect(formatPriceMXN(1500)).toMatch(/1[,.]?500/);
  });
  it("formatea precio 0 como gratis", () => {
    expect(formatPriceMXN(0)).toMatch(/0/);
  });
  it("formatea con decimales cuando showDecimals=true", () => {
    expect(formatPriceMXN(1500, true)).toMatch(/1[,.]?500[.,]00/);
  });
});

describe("firstNameFromFullName", () => {
  it("extrae el primer nombre", () => expect(firstNameFromFullName("María López")).toBe("María"));
  it("funciona con nombre único", () => expect(firstNameFromFullName("Carlos")).toBe("Carlos"));
  it("retorna 'Usuario' para null", () => expect(firstNameFromFullName(null)).toBe("Usuario"));
  it("retorna 'Usuario' para undefined", () => expect(firstNameFromFullName(undefined)).toBe("Usuario"));
  it("retorna 'Usuario' para string vacío", () => expect(firstNameFromFullName("")).toBe("Usuario"));
  it("elimina espacios al inicio", () => expect(firstNameFromFullName("  Ana García")).toBe("Ana"));
});

describe("stripHtml", () => {
  it("elimina etiquetas HTML", () => expect(stripHtml("<p>Hola</p>")).toBe("Hola"));
  it("elimina tags anidados", () => expect(stripHtml("<div><b>Texto</b></div>")).toBe("Texto"));
  it("reemplaza &nbsp; con espacio", () => expect(stripHtml("hola&nbsp;mundo")).toBe("hola mundo"));
  it("retorna vacío para null", () => expect(stripHtml(null)).toBe(""));
  it("retorna vacío para undefined", () => expect(stripHtml(undefined)).toBe(""));
  it("retorna texto plano sin cambios", () => expect(stripHtml("texto plano")).toBe("texto plano"));
});
