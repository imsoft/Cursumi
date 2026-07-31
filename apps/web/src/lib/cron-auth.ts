import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * Comprueba que quien llama a un cron es Vercel y no cualquiera.
 *
 * Dos cosas que la comparación suelta (`header !== \`Bearer ${process.env.CRON_SECRET}\``)
 * hacía mal:
 *
 *  1. Si `CRON_SECRET` no estuviera definido, el valor esperado sería la cadena
 *     "Bearer undefined" — y bastaría mandar justo eso para disparar envíos
 *     masivos de correo. Aquí, sin secreto configurado, no pasa nadie.
 *  2. `!==` corta en el primer byte distinto, así que el tiempo de respuesta
 *     filtra cuánto prefijo acertaste. Se compara en tiempo constante.
 *
 * Devuelve `null` si la petición es legítima, o la respuesta 401/500 si no.
 */
export function checkCronAuth(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron] CRON_SECRET no está configurado; se rechaza la petición.");
    return NextResponse.json({ error: "Cron no configurado" }, { status: 500 });
  }

  const recibido = req.headers.get("authorization") ?? "";
  const esperado = `Bearer ${secret}`;

  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  // timingSafeEqual exige la misma longitud; comparar longitudes por separado
  // solo revela el tamaño del secreto, no su contenido.
  const ok = a.length === b.length && timingSafeEqual(a, b);

  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
