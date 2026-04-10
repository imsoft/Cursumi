/**
 * Cloudflare Turnstile — CAPTCHA server-side verification.
 *
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 *
 * Variables de entorno requeridas:
 *   TURNSTILE_SECRET_KEY — obtenida del dashboard de Cloudflare Turnstile
 */

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verifica un token de Cloudflare Turnstile en el servidor.
 *
 * @param token  El valor del campo `cf-turnstile-response` enviado desde el cliente
 * @param ip     IP del cliente (opcional, para mayor seguridad)
 * @returns true si el CAPTCHA es válido, false en caso contrario
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  ip?: string
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  const isProd = process.env.NODE_ENV === "production";

  // Sin clave configurada: en producción bloquear, en dev omitir
  if (!secretKey) {
    if (isProd) {
      console.error("[Turnstile] TURNSTILE_SECRET_KEY no configurada en producción — bloqueando.");
      return { success: false, error: "Verificación de seguridad no disponible. Contacta al soporte." };
    }
    console.warn("[Turnstile] TURNSTILE_SECRET_KEY no configurada — omitiendo verificación (dev)");
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "CAPTCHA requerido. Completa el desafío de seguridad." };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (ip) formData.append("remoteip", ip);

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
      // Timeout de 5 segundos para no bloquear el registro si Cloudflare falla
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      console.error("[Turnstile] Error HTTP al verificar:", response.status);
      if (isProd) {
        return { success: false, error: "Error al verificar el CAPTCHA. Intenta de nuevo." };
      }
      return { success: true };
    }

    const data: TurnstileResponse = await response.json();

    if (!data.success) {
      const codes = data["error-codes"]?.join(", ") ?? "unknown";
      console.warn("[Turnstile] Token inválido. Códigos de error:", codes);
      return {
        success: false,
        error: "El desafío de seguridad no es válido. Recarga la página e inténtalo de nuevo.",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("[Turnstile] Error al conectar con Cloudflare:", err);
    if (isProd) {
      return { success: false, error: "No se pudo verificar el CAPTCHA. Intenta de nuevo." };
    }
    return { success: true };
  }
}
