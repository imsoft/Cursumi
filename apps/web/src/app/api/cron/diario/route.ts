import { NextRequest, NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron-auth";
import { diaSemanaEnMexico } from "@/lib/fecha";
import {
  DIA_DE_TRABAJOS_SEMANALES,
  invitacionesDeReflexion,
  publicarBlogProgramado,
  recordatoriosDePerfil,
  recordatoriosDePlaneacion,
  recordatoriosDeProgreso,
  recordatoriosDeReintentoDeExamen,
} from "@/lib/cron-jobs";

/**
 * El único cron del proyecto.
 *
 * El plan gratuito de Vercel admite muy pocos crons y solo con frecuencia
 * diaria. Había seis declarados, cuatro de ellos semanales, así que la mayoría
 * no llegaba a ejecutarse nunca y esos recordatorios no salían.
 *
 * Ahora hay una sola entrada: esta ruta corre a diario, ejecuta los trabajos
 * diarios siempre y los semanales solo el día que les toca, calculado en
 * horario de México.
 *
 * Ningún trabajo puede tumbar a los demás: cada uno se ejecuta aislado y su
 * error queda en el resultado.
 */
export const maxDuration = 60;

type Resultado = Record<string, unknown>;

async function ejecutar(nombre: string, trabajo: () => Promise<Resultado>) {
  try {
    return await trabajo();
  } catch (err) {
    console.error(`[cron] ${nombre} falló:`, err);
    return { error: err instanceof Error ? err.message : "desconocido" };
  }
}

export async function GET(req: NextRequest) {
  const noAutorizado = checkCronAuth(req);
  if (noAutorizado) return noAutorizado;

  const dia = diaSemanaEnMexico();
  const resultados: Resultado = {};

  // Diarios
  resultados.blog = await ejecutar("blog", publicarBlogProgramado);
  resultados.reintentosDeExamen = await ejecutar(
    "reintentosDeExamen",
    recordatoriosDeReintentoDeExamen,
  );
  resultados.reflexiones = await ejecutar("reflexiones", invitacionesDeReflexion);

  // Semanales, solo el día que toca
  if (dia === DIA_DE_TRABAJOS_SEMANALES.progreso) {
    resultados.progreso = await ejecutar("progreso", recordatoriosDeProgreso);
  }
  if (dia === DIA_DE_TRABAJOS_SEMANALES.planeacion) {
    resultados.planeacion = await ejecutar("planeacion", recordatoriosDePlaneacion);
  }
  if (dia === DIA_DE_TRABAJOS_SEMANALES.perfil) {
    resultados.perfil = await ejecutar("perfil", recordatoriosDePerfil);
  }

  return NextResponse.json({ dia, resultados });
}
