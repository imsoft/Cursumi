import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Map en memoria por instancia del servidor.
// Para producción multi-instancia (múltiples workers Vercel), usar Upstash Redis.
const store = new Map<string, RateLimitEntry>();

// Limpiar entradas expiradas periódicamente para evitar memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60_000);

export interface RateLimitConfig {
  /** Número máximo de requests permitidos en la ventana */
  limit: number;
  /** Duración de la ventana en segundos */
  windowSecs: number;
  /** Clave de identificación (ej. IP + ruta) */
  key: string;
}

/**
 * Verifica si un request supera el rate limit.
 * Retorna `null` si está dentro del límite, o una respuesta 429 si lo supera.
 */
export function checkRateLimit(config: RateLimitConfig): NextResponse | null {
  const { limit, windowSecs, key } = config;
  const now = Date.now();
  const windowMs = windowSecs * 1_000;

  let entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return null;
  }

  entry.count++;

  if (entry.count > limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1_000);
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1_000)),
        },
      }
    );
  }

  return null;
}

/**
 * Obtiene la IP del request de forma compatible con proxies (Vercel, Cloudflare).
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
