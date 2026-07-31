/**
 * Pasa los videos de Mux que ya están subidos de reproducción PÚBLICA a FIRMADA.
 *
 * El problema que resuelve: un playback id público reproduce el video en
 * stream.mux.com sin sesión, para siempre y compartible. Los videos de cursos de
 * paga se filtraban con solo pasar el enlace.
 *
 * Qué hace, lección por lección:
 *   1. Saca el playback id de `Lesson.videoUrl`.
 *   2. Pregunta a Mux a qué asset pertenece y con qué política.
 *   3. Si es público: crea un playback id NUEVO con política `signed`,
 *      actualiza `videoUrl` en la base y recién entonces borra el público.
 *
 * El orden importa: primero crear y guardar, al final borrar. Si algo revienta
 * a mitad, el video sigue reproduciéndose con el id viejo.
 *
 * Uso:
 *   # Ver qué haría, sin tocar nada (por defecto):
 *   source .env && npx tsx scripts/mux-migrar-a-firmado.ts
 *
 *   # Aplicar de verdad:
 *   source .env && npx tsx scripts/mux-migrar-a-firmado.ts --aplicar
 *
 * Requiere MUX_TOKEN_ID y MUX_TOKEN_SECRET. Antes de correrlo con --aplicar,
 * configura MUX_SIGNING_KEY_ID y MUX_SIGNING_KEY_PRIVATE en Vercel y despliega:
 * si no, la app no sabrá firmar y los videos migrados no se verán.
 */

// El cliente del proyecto: lleva el adaptador de Neon, sin el cual
// `new PrismaClient()` ni siquiera arranca.
import { prisma } from "../src/lib/prisma";

const APLICAR = process.argv.includes("--aplicar");
const REVERTIR = process.argv.includes("--revertir");
/** `--limite N` migra solo N videos: sirve para probar con uno antes de ir por todos. */
const LIMITE = (() => {
  const i = process.argv.indexOf("--limite");
  const n = i >= 0 ? Number(process.argv[i + 1]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : Infinity;
})();
const API = "https://api.mux.com/video/v1";

function auth(): string {
  const id = process.env.MUX_TOKEN_ID;
  const secret = process.env.MUX_TOKEN_SECRET;
  if (!id || !secret) throw new Error("Faltan MUX_TOKEN_ID y MUX_TOKEN_SECRET");
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

async function mux<T>(ruta: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${ruta}`, {
    ...init,
    headers: { Authorization: auth(), "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`Mux ${init?.method ?? "GET"} ${ruta} → ${res.status} ${await res.text()}`);
  return res.status === 204 ? (null as T) : ((await res.json()) as T);
}

function playbackIdDe(url: string): string | null {
  return url.match(/stream\.mux\.com\/([^/.]+)/)?.[1] ?? null;
}

/**
 * Deshace la migración: vuelve a poner un id público y quita el firmado.
 * Existe para poder retroceder rápido si algo sale mal a media migración
 * (por ejemplo, si la app todavía no tiene las llaves y los videos no cargan).
 */
async function revertir() {
  const lecciones = await prisma.lesson.findMany({
    where: { videoUrl: { contains: "stream.mux.com" } },
    select: { id: true, title: true, videoUrl: true },
  });
  let hechas = 0;

  for (const leccion of lecciones) {
    const id = leccion.videoUrl ? playbackIdDe(leccion.videoUrl) : null;
    if (!id) continue;
    try {
      const info = await mux<{ data: { policy: string; object: { id: string } } }>(`/playback-ids/${id}`);
      if (info.data.policy !== "signed") continue;

      const assetId = info.data.object.id;
      console.log(`• ${leccion.title}  (asset ${assetId})`);
      if (!APLICAR) { console.log("    → volvería a público\n"); hechas++; continue; }

      const creado = await mux<{ data: { id: string } }>(`/assets/${assetId}/playback-ids`, {
        method: "POST",
        body: JSON.stringify({ policy: "public" }),
      });
      await prisma.lesson.update({
        where: { id: leccion.id },
        data: { videoUrl: `https://stream.mux.com/${creado.data.id}.m3u8` },
      });
      await mux(`/assets/${assetId}/playback-ids/${id}`, { method: "DELETE" });
      console.log(`    ✓ público ${creado.data.id}\n`);
      hechas++;
    } catch (error) {
      console.error(`    ✗ ${leccion.title}: ${error instanceof Error ? error.message : error}\n`);
    }
  }
  console.log(`revertidas: ${hechas}`);
}

async function main() {
  if (REVERTIR) {
    console.log(APLICAR ? "▶ REVIRTIENDO a público\n" : "▶ Simulación de reversión\n");
    return revertir();
  }
  console.log(APLICAR ? "▶ Aplicando cambios\n" : "▶ Simulación (usa --aplicar para ejecutar)\n");
  if (LIMITE !== Infinity) console.log(`   (limitado a ${LIMITE})\n`);

  const lecciones = await prisma.lesson.findMany({
    where: { videoUrl: { contains: "stream.mux.com" } },
    select: { id: true, title: true, videoUrl: true },
  });
  console.log(`${lecciones.length} lecciones con video de Mux\n`);

  let migradas = 0, yaFirmadas = 0, fallos = 0;

  for (const leccion of lecciones) {
    if (migradas >= LIMITE) break;
    const publicId = leccion.videoUrl ? playbackIdDe(leccion.videoUrl) : null;
    if (!publicId) continue;

    try {
      const info = await mux<{ data: { policy: string; object: { id: string; type: string } } }>(
        `/playback-ids/${publicId}`,
      );

      if (info.data.policy === "signed") {
        yaFirmadas++;
        continue;
      }

      const assetId = info.data.object.id;
      console.log(`• ${leccion.title}`);
      console.log(`    asset ${assetId}  público ${publicId}`);

      if (!APLICAR) {
        console.log("    → crearía un id firmado, actualizaría la lección y borraría el público\n");
        migradas++;
        continue;
      }

      const creado = await mux<{ data: { id: string } }>(`/assets/${assetId}/playback-ids`, {
        method: "POST",
        body: JSON.stringify({ policy: "signed" }),
      });
      const signedId = creado.data.id;

      await prisma.lesson.update({
        where: { id: leccion.id },
        data: { videoUrl: `https://stream.mux.com/${signedId}.m3u8` },
      });

      // Hasta aquí el video ya se sirve firmado; el público se retira al final.
      await mux(`/assets/${assetId}/playback-ids/${publicId}`, { method: "DELETE" });

      console.log(`    ✓ firmado ${signedId}, público retirado\n`);
      migradas++;
    } catch (error) {
      fallos++;
      console.error(`    ✗ ${leccion.title}: ${error instanceof Error ? error.message : error}\n`);
    }
  }

  console.log("─".repeat(50));
  console.log(`migradas: ${migradas}   ya firmadas: ${yaFirmadas}   fallos: ${fallos}`);
  if (!APLICAR && migradas > 0) console.log("\nVuelve a correrlo con --aplicar para ejecutarlo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
