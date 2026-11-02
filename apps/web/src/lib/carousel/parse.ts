/**
 * Formato de un carrusel (archivo .md):
 *
 *   > Mito                      ← etiqueta opcional (pastilla arriba del título)
 *   # No eres "visual".         ← título
 *   Te mintieron.               ← cada línea de texto es un párrafo
 *   1. Paso uno                 ← "1." / "-" se pintan como lista
 *   Fuente: Pashler (2008)      ← nota pequeña al pie
 *   ---                         ← separa slides
 *
 * La primera slide es la portada y la última, el cierre. `**palabra**`
 * resalta una palabra. Sin emojis: la tipografía no los trae.
 */

export type Segment = { text: string; highlight: boolean };

export type Block =
  | { kind: "paragraph"; segments: Segment[] }
  | { kind: "list-item"; marker: string; segments: Segment[] };

export type SlideRole = "cover" | "content" | "closing";

export type Slide = {
  role: SlideRole;
  index: number;
  total: number;
  tag: string | null;
  title: Segment[] | null;
  blocks: Block[];
  source: string | null;
};

export function parseInline(text: string): Segment[] {
  const segments: Segment[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) segments.push({ text: text.slice(last, m.index), highlight: false });
    segments.push({ text: m[1], highlight: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last), highlight: false });
  return segments;
}

export function parseCarousel(markdown: string): Slide[] {
  const chunks = markdown
    .replace(/\r\n/g, "\n")
    .split(/^\s*---\s*$/m)
    .map((c) => c.trim())
    .filter(Boolean);

  if (chunks.length < 2) {
    throw new Error("Un carrusel necesita al menos 2 slides (portada y cierre), separadas por ---");
  }

  return chunks.map((chunk, i) => {
    const slide: Slide = {
      role: i === 0 ? "cover" : i === chunks.length - 1 ? "closing" : "content",
      index: i + 1,
      total: chunks.length,
      tag: null,
      title: null,
      blocks: [],
      source: null,
    };

    for (const raw of chunk.split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith("> ")) slide.tag = line.slice(2).trim();
      else if (line.startsWith("# ")) slide.title = parseInline(line.slice(2).trim());
      else if (/^fuente:/i.test(line)) slide.source = line.replace(/^fuente:\s*/i, "");
      else {
        const list = line.match(/^(\d+\.|[-•])\s+(.*)$/);
        if (list) {
          const marker = /^\d/.test(list[1]) ? list[1].replace(".", "") : "•";
          slide.blocks.push({ kind: "list-item", marker, segments: parseInline(list[2]) });
        } else {
          slide.blocks.push({ kind: "paragraph", segments: parseInline(line) });
        }
      }
    }

    if (!slide.title && slide.blocks.length === 0) {
      throw new Error(`La slide ${i + 1} está vacía`);
    }
    return slide;
  });
}

/** Caracteres de texto de la slide, para ajustar el tamaño de letra. */
export function slideTextLength(slide: Slide): number {
  return slide.blocks.reduce((n, b) => n + b.segments.reduce((m, s) => m + s.text.length, 0), 0);
}

/**
 * Agrupa el texto en palabras que no se deben partir. Lo que va pegado a un
 * resaltado sin espacio (el punto de "**refuerzas**.") viaja en la misma
 * palabra, para que el salto de línea no lo deje solo.
 */
export function toWords(segments: Segment[]): Segment[][] {
  const words: Segment[][] = [];
  let glued = false; // ¿lo siguiente se pega a la última palabra?
  for (const s of segments) {
    if (s.highlight) {
      if (glued && words.length) words[words.length - 1].push(s);
      else words.push([s]);
      glued = true;
      continue;
    }
    const tokens = s.text.split(/(\s+)/);
    for (const t of tokens) {
      if (!t) continue;
      if (/^\s+$/.test(t)) {
        glued = false;
        continue;
      }
      const piece = { text: t, highlight: false };
      if (glued && words.length) words[words.length - 1].push(piece);
      else words.push([piece]);
      glued = true;
    }
  }
  return words;
}
