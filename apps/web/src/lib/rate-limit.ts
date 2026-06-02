import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Redis (Upstash) cuando hay credenciales en env, fallback a Map en memoria para desarrollo
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Fallback en memoria para desarrollo local (no persistente entre reinicios)
const store = new Map<string, RateLimitEntry>();

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

function rateLimitResponse(retryAfter: number, limit: number, resetAt: number): NextResponse {
  return NextResponse.json(
    { error: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(resetAt / 1_000)),
      },
    }
  );
}

/**
 * Verifica si un request supera el rate limit.
 * En producción usa Upstash Redis (multi-instancia). En desarrollo usa Map en memoria.
 * Retorna `null` si está dentro del límite, o una respuesta 429 si lo supera.
 * Agrega UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN al .env para activar Redis.
 */
export async function checkRateLimitAsync(config: RateLimitConfig): Promise<NextResponse | null> {
  const { limit, windowSecs, key } = config;

  if (redis) {
    try {
      // Redis sliding window con INCR + EXPIRE
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, windowSecs);
      }
      if (count > limit) {
        const ttl = await redis.ttl(key);
        return rateLimitResponse(ttl, limit, Date.now() + ttl * 1000);
      }
      return null;
    } catch {
      // Si Redis no está disponible, continuar sin limitar (mejor disponibilidad que seguridad aquí)
      console.warn("[rate-limit] Redis unavailable, skipping rate limit check for key:", key);
      return null;
    }
  }

  // Fallback en memoria
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
    return rateLimitResponse(retryAfter, limit, entry.resetAt);
  }

  return null;
}

/**
 * Versión síncrona (solo funciona con el store en memoria).
 * Usada en middlewares donde no se puede hacer await al nivel de módulo.
 * En producción con Redis, usar checkRateLimitAsync().
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
    return rateLimitResponse(retryAfter, limit, entry.resetAt);
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
