import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { prisma } from "./prisma";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";
import { validateEmailDomain } from "./disposable-email";
import { verifyTurnstile } from "./turnstile";
import { checkRateLimitAsync } from "./rate-limit";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token }: { user: { email: string; name?: string | null }; url: string; token: string }) => {
      const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetLink = `${baseURL}/reset-password?token=${token}`;
      try {
        await sendPasswordResetEmail({
          to: user.email,
          name: user.name || "Usuario",
          resetLink,
        });
      } catch (err) {
        console.error("Error enviando email de reset:", err);
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, token }: { user: { email: string; name?: string | null }; url: string; token: string }) => {
      const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const verificationLink = `${baseURL}/verify-email?token=${token}`;
      try {
        await sendVerificationEmail({
          to: user.email,
          name: user.name || "Usuario",
          verificationLink,
        });
      } catch (err) {
        // No lanzar error para que el registro no falle si el email no se envía
        console.error("Error enviando email de verificación:", err);
      }
    },
    sendOnSignUp: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días por defecto
    updateAge: 60 * 60 * 24, // Actualizar cada 24 horas
  },
  plugins: [
    nextCookies(), // Debe ser el último plugin
  ],
  /**
   * Rate limiting nativo de Better Auth (aplica globalmente a todos los endpoints auth).
   * Para el sign-up usamos además una regla customizada más estricta (3/hora).
   */
  rateLimit: {
    enabled: true,
    window: 60,   // ventana de 60 segundos
    max: 20,      // máx 20 requests por ventana (protección general)
    storage: process.env.UPSTASH_REDIS_REST_URL ? "secondary-storage" : "memory",
    customRules: {
      "/sign-up/email": {
        window: 3600, // 1 hora
        max: 3,       // máx 3 registros por hora
      },
    },
  },
  hooks: {
    /**
     * Hook de seguridad aplicado ANTES de procesar peticiones auth.
     * Controles:
     *   1. Rate limiting global (50 req/min) usando Upstash Redis.
     *   2. Rate limiting granular (3 req/hora) para endpoints sensibles (sign-up, forgot-password).
     *   3. CAPTCHA (Cloudflare Turnstile) obligatorio en endpoints sensibles.
     *   4. Validación de dominio de email en sign-up.
     */
    before: createAuthMiddleware(async (ctx) => {
      // Obtener IP del cliente (compatible con Vercel / Cloudflare proxy)
      const ip =
        ctx.request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        ctx.request?.headers?.get("x-real-ip") ||
        "unknown";

      // ── 1. Global Rate Limiting: 50 requests por minuto ────────
      const globalRateLimitResult = await checkRateLimitAsync({
        key: `auth-global:${ip}`,
        limit: 50,
        windowSecs: 60,
      });

      if (globalRateLimitResult !== null) {
        throw new APIError("TOO_MANY_REQUESTS", {
          message: "Demasiadas solicitudes. Por favor, espera un momento.",
        });
      }

      const isSignup = ctx.path === "/sign-up/email";
      const isForgotPassword = ctx.path === "/forget-password";

      if (isSignup || isForgotPassword) {
        // ── 2. Rate limiting granular por IP: máx 3 registros/recuperaciones por hora ────────
        const actionType = isSignup ? "signup" : "forgot-password";
        const rateLimitResult = await checkRateLimitAsync({
          key: `auth-sensitive:${actionType}:${ip}`,
          limit: 3,
          windowSecs: 3600,
        });

        if (rateLimitResult !== null) {
          throw new APIError("TOO_MANY_REQUESTS", {
            message: "Demasiados intentos. Espera una hora e intenta de nuevo.",
          });
        }

        // ── 3. CAPTCHA: Cloudflare Turnstile ─────────────────────────────
        const body = ctx.body as Record<string, unknown> | undefined;
        const captchaToken = body?.["cf-turnstile-response"] as string | undefined;

        const captchaResult = await verifyTurnstile(captchaToken, ip);
        if (!captchaResult.success) {
          throw new APIError("BAD_REQUEST", {
            message: captchaResult.error ?? "El desafío de seguridad no es válido. Recarga la página e inténtalo de nuevo.",
          });
        }

        // ── 4. Validar dominio de email (Solo Sign-up) ───────────────────
        if (isSignup) {
          const email = body?.["email"] as string | undefined;
          if (email) {
            const domainResult = await validateEmailDomain(email, true);
            if (!domainResult.valid) {
              throw new APIError("BAD_REQUEST", {
                message: domainResult.reason ?? "El dominio del email no está permitido.",
              });
            }
          }
        }
      }
    }),
    /**
     * Hook DESPUÉS de procesar sign-in y sign-up.
     *
     * Normaliza las respuestas de error para evitar enumeración de usuarios:
     *  - Sign-in: EMAIL_NOT_VERIFIED (403) → misma respuesta genérica que INVALID_EMAIL_OR_PASSWORD (401)
     *  - Sign-up: USER_ALREADY_EXISTS → respuesta 200 genérica (indistinguible de éxito)
     *
     * Esto impide que un atacante use las respuestas de la API para confirmar
     * si un email está registrado en la plataforma.
     */
    after: createAuthMiddleware(async (ctx) => {
      // ── Sign-in: normalizar EMAIL_NOT_VERIFIED a credenciales inválidas genéricas ──
      if (ctx.path === "/sign-in/email") {
        const returned = ctx.context.returned;
        // Si la respuesta es un error con código que revela existencia del email
        if (
          returned instanceof Response &&
          (returned.status === 403 || returned.status === 200)
        ) {
          let body: Record<string, unknown> = {};
          try {
            body = await returned.clone().json();
          } catch {
            return;
          }
          const code = body?.code as string | undefined;
          // EMAIL_NOT_VERIFIED revela que el email SÍ existe → neutralizar
          if (code === "EMAIL_NOT_VERIFIED") {
            return {
              response: Response.json(
                {
                  code: "INVALID_CREDENTIALS",
                  message: "Correo o contraseña incorrectos.",
                },
                { status: 401 }
              ),
            };
          }
        }
      }

      // ── Sign-up: normalizar USER_ALREADY_EXISTS a respuesta genérica ──────────
      if (ctx.path === "/sign-up/email") {
        const returned = ctx.context.returned;
        if (returned instanceof Response && returned.status >= 400) {
          let body: Record<string, unknown> = {};
          try {
            body = await returned.clone().json();
          } catch {
            return;
          }
          const code = body?.code as string | undefined;
          // Normalizar cualquier error que revele existencia del email
          if (
            code === "USER_ALREADY_EXISTS" ||
            code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
          ) {
            // Devolver 200 genérico: el atacante no puede distinguir si el email existía
            return {
              response: Response.json(
                {
                  message: "Si el correo es válido, recibirás un enlace de verificación en breve.",
                },
                { status: 200 }
              ),
            };
          }
        }
      }
    }),
  },
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  basePath: "/api/auth",
  trustedOrigins: getTrustedOrigins(),
});

function getTrustedOrigins(): string[] {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) return ["http://localhost:3000"];
  const base = url.replace(/\/$/, "");
  const origins = [base];
  if (base.startsWith("https://www.")) {
    origins.push(base.replace("https://www.", "https://"));
  } else if (base.startsWith("https://")) {
    origins.push(base.replace("https://", "https://www."));
  }
  return origins;
}

export type Session = typeof auth.$Infer.Session;
