import { describe, it, expect } from "vitest";
import { parseCarousel, parseInline, slideTextLength, toWords } from "@/lib/carousel/parse";

const md = `> Mito
# No eres "visual".
Te **mintieron**.
---
# Cómo hacerlo
1. Estudia 20 minutos.
- Cierra todo.
Fuente: Roediger y Karpicke (2006)
---
# Guarda esto
Más en **cursumi.com**
`;

describe("parseCarousel", () => {
  it("separa slides y asigna portada, contenido y cierre", () => {
    const slides = parseCarousel(md);
    expect(slides.map((s) => s.role)).toEqual(["cover", "content", "closing"]);
    expect(slides.map((s) => `${s.index}/${s.total}`)).toEqual(["1/3", "2/3", "3/3"]);
  });

  it("lee etiqueta, título, párrafos, listas y fuente", () => {
    const [cover, content] = parseCarousel(md);
    expect(cover.tag).toBe("Mito");
    expect(cover.title).toEqual([{ text: 'No eres "visual".', highlight: false }]);
    expect(cover.blocks).toEqual([
      {
        kind: "paragraph",
        segments: [
          { text: "Te ", highlight: false },
          { text: "mintieron", highlight: true },
          { text: ".", highlight: false },
        ],
      },
    ]);
    expect(content.blocks.map((b) => (b.kind === "list-item" ? b.marker : b.kind))).toEqual(["1", "•"]);
    expect(content.source).toBe("Roediger y Karpicke (2006)");
  });

  it("acepta saltos de línea de Windows", () => {
    expect(parseCarousel(md.replace(/\n/g, "\r\n"))).toHaveLength(3);
  });

  it("exige portada y cierre", () => {
    expect(() => parseCarousel("# Solo una")).toThrow(/al menos 2 slides/);
  });

  it("rechaza slides vacías", () => {
    expect(() => parseCarousel("# Uno\n---\nFuente: x\n---\n# Tres")).toThrow(/slide 2 está vacía/);
  });
});

describe("parseInline / toWords", () => {
  it("sin resaltado devuelve un solo segmento", () => {
    expect(parseInline("hola mundo")).toEqual([{ text: "hola mundo", highlight: false }]);
  });

  it("la puntuación pegada a un resaltado viaja con él", () => {
    const words = toWords(parseInline("lo **refuerzas**. Releer no"));
    expect(words.map((w) => w.map((p) => p.text).join(""))).toEqual(["lo", "refuerzas.", "Releer", "no"]);
    expect(words[1][0].highlight).toBe(true);
  });

  it("un resaltado de varias palabras no se parte", () => {
    const words = toWords(parseInline("Combinar **palabras e imágenes** siempre"));
    expect(words).toHaveLength(3);
    expect(words[1]).toEqual([{ text: "palabras e imágenes", highlight: true }]);
  });

  it("slideTextLength cuenta solo el cuerpo", () => {
    const [, content] = parseCarousel(md);
    expect(slideTextLength(content)).toBe("Estudia 20 minutos.".length + "Cierra todo.".length);
  });
});
