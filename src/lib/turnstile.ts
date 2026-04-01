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

  // Si no hay clave configurada (ej. dev sin Turnstile), dejar pasar con log
  if (!secretKey) {
    console.warn(
      "[Turnstile] TURNSTILE_SECRET_KEY no configurada — omitiendo verificación CAPTCHA"
    );
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
      // En caso de error del servicio de Cloudflare, dejar pasar (disponibilidad > seguridad)
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
    // Timeout o error de red — dejar pasar para no bloquear usuarios legítimos
    console.error("[Turnstile] Error al conectar con Cloudflare:", err);
    return { success: true };
  }
}
