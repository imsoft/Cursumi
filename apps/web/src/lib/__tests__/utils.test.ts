import { describe, it, expect } from "vitest";
import {
  parseDurationToMinutes,
  formatPriceMXN,
  firstNameFromFullName,
  stripHtml,
  metaDescription,
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
  it("formatea precio 0 como 'Gratis'", () => {
    expect(formatPriceMXN(0)).toBe("Gratis");
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

  it("decodifica las entidades del editor", () => {
    expect(stripHtml("<p>Ventas &amp; Marketing</p>")).toBe("Ventas & Marketing");
    expect(stripHtml("<p>El &quot;mejor&quot; curso</p>")).toBe('El "mejor" curso');
    expect(stripHtml("<p>Qu&#39;est-ce</p>")).toBe("Qu'est-ce");
  });

  it("no se come el texto cuando el usuario escribió una etiqueta escapada", () => {
    // Decodificar antes de quitar etiquetas convertiría esto en <b> y lo borraría.
    expect(stripHtml("<p>Usa &lt;b&gt; para negritas</p>")).toBe("Usa <b> para negritas");
  });
});

describe("metaDescription", () => {
  it("quita el HTML de la descripción, que es lo que veía WhatsApp", () => {
    expect(metaDescription("<p>Aprende <strong>ventas</strong></p>")).toBe("Aprende ventas");
  });

  it("colapsa en una sola línea los saltos que dejan los párrafos", () => {
    expect(metaDescription("<p>Primero</p><p>Segundo</p>")).toBe("PrimeroSegundo");
    expect(metaDescription("<p>Uno</p>\n\n   <p>Dos</p>")).toBe("Uno Dos");
  });

  it("recorta por palabra completa y marca el corte", () => {
    const largo = "palabra ".repeat(40).trim();
    const r = metaDescription(largo);
    expect(r.length).toBeLessThanOrEqual(161);
    expect(r.endsWith("…")).toBe(true);
    expect(r).not.toContain("palab…");
  });

  it("respeta un máximo a medida", () => {
    expect(metaDescription("<p>uno dos tres cuatro</p>", 10)).toBe("uno dos…");
  });

  it("deja intacto lo que ya cabe", () => {
    expect(metaDescription("<p>Curso corto</p>")).toBe("Curso corto");
  });

  it("tolera null y undefined", () => {
    expect(metaDescription(null)).toBe("");
    expect(metaDescription(undefined)).toBe("");
  });
});
