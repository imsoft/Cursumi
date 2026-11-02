/**
 * Genera las imágenes de un carrusel para Instagram / TikTok.
 *
 *   pnpm carousel content/carousels/estilos-de-aprendizaje.md
 *   pnpm carousel content/carousels/*.md
 *
 * Deja un PNG de 1080×1350 por slide en content/carousels/out/<nombre>/.
 * El formato del .md está documentado en src/lib/carousel/parse.ts.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { parseCarousel } from "@/lib/carousel/parse";
import { renderSlide } from "@/lib/carousel/render";

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("Uso: pnpm carousel <archivo.md> [más archivos...]");
    process.exit(1);
  }

  for (const file of files) {
    const slides = parseCarousel(await readFile(file, "utf8"));
    const outDir = join(dirname(file), "out", basename(file, ".md"));
    await mkdir(outDir, { recursive: true });
    for (const slide of slides) {
      const name = `${String(slide.index).padStart(2, "0")}.png`;
      await writeFile(join(outDir, name), await renderSlide(slide));
    }
    console.log(`✓ ${file} → ${outDir} (${slides.length} slides)`);
  }
}

main().catch((err) => {
  console.error(process.env.DEBUG ? err : err instanceof Error ? err.message : err);
  process.exit(1);
});
