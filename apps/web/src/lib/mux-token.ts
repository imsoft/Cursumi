import { createSign } from "node:crypto";

/**
 * Tokens de reproducción firmados para Mux.
 *
 * Por qué existe esto: los assets creados con `playback_policy: ["public"]`
 * tienen un id que reproduce el video en stream.mux.com SIN sesión, para
 * siempre y compartible. O sea, el video de un curso de paga se podía pasar por
 * WhatsApp y funcionaba. Con política `signed`, Mux exige un JWT de corta vida
 * que solo emitimos aquí, y solo después de comprobar que el alumno está
 * inscrito.
 *
 * Configuración (panel de Mux → Settings → Signing Keys):
 *   MUX_SIGNING_KEY_ID       el id de la llave (empieza con algo tipo "abc123")
 *   MUX_SIGNING_KEY_PRIVATE  la llave privada, en base64 tal cual la entrega Mux
 *
 * Si falta cualquiera de las dos, `createMuxPlaybackToken` devuelve null y la
 * app sigue funcionando con los videos públicos de siempre. Así el despliegue
 * no se rompe antes de que existan las llaves.
 */

/** Vida del token. Corta a propósito: si se filtra, sirve de poco. */
const VIGENCIA_SEGUNDOS = 60 * 60 * 2;

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** La llave llega en base64; algunos entornos la guardan ya en PEM. */
function leerLlavePrivada(valor: string): string {
  const limpio = valor.trim();
  if (limpio.includes("BEGIN")) return limpio.replace(/\\n/g, "\n");
  return Buffer.from(limpio, "base64").toString("utf8");
}

export function muxSigningConfigurado(): boolean {
  return !!(process.env.MUX_SIGNING_KEY_ID && process.env.MUX_SIGNING_KEY_PRIVATE);
}

/**
 * JWT de reproducción para un playbackId.
 *
 * `aud: "v"` es el público que espera Mux para ver el video (hay otros para
 * miniaturas o storyboards; aquí solo nos interesa la reproducción).
 *
 * Devuelve null si no hay llaves configuradas — el llamador debe tratarlo como
 * "este video es público" y no pasar token.
 */
export function createMuxPlaybackToken(
  playbackId: string,
  opciones?: { vigenciaSegundos?: number },
): string | null {
  const kid = process.env.MUX_SIGNING_KEY_ID;
  const llave = process.env.MUX_SIGNING_KEY_PRIVATE;
  if (!kid || !llave || !playbackId) return null;

  const ahora = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT", kid };
  const payload = {
    sub: playbackId,
    aud: "v",
    exp: ahora + (opciones?.vigenciaSegundos ?? VIGENCIA_SEGUNDOS),
    kid,
  };

  const cuerpo = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;

  try {
    const firma = createSign("RSA-SHA256").update(cuerpo).end()
      .sign(leerLlavePrivada(llave));
    return `${cuerpo}.${base64url(firma)}`;
  } catch (error) {
    // Una llave mal pegada no debe tumbar la lección: se registra y se sigue
    // sin token (el video fallará si es privado, pero la página carga).
    console.error("[mux] No se pudo firmar el token de reproducción:", error);
    return null;
  }
}
