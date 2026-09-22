/**
 * Plugin de better-auth para las apps nativas de iOS y Android.
 *
 * Sustituye a `@better-auth/expo` (retirado con la app Expo) reproduciendo las
 * tres cosas que una app nativa necesita del servidor de auth:
 *
 * 1. **Origen**: la app manda `x-native-origin: mobile://` y aquí se copia a
 *    `Origin`, para pasar la comprobación de origen de los POST (los clientes
 *    nativos no mandan `Origin`).
 * 2. **Proxy de autorización** (`/native-authorization-proxy`): el login con
 *    Google se abre en el navegador del sistema, que no tiene la cookie `state`
 *    que fija `sign-in/social`. Este endpoint la fija en el navegador y redirige
 *    a Google.
 * 3. **Cookie en el deep link**: al terminar el callback, si la redirección va
 *    a un scheme de app (`mobile://`), se añade la cabecera `Set-Cookie` como
 *    parámetro `cookie` para que la app guarde la sesión.
 */
import { APIError, createAuthEndpoint, createAuthMiddleware } from "better-auth/api";
import type { BetterAuthPlugin } from "better-auth";
import { z } from "zod";

export const NATIVE_ORIGIN_HEADER = "x-native-origin";

/**
 * Si `location` es un deep link de app (scheme distinto de http/https) y de
 * confianza, devuelve la misma URL con la cookie como parámetro `cookie`.
 * Devuelve null cuando no hay que tocar la redirección.
 */
export function withCookieInNativeRedirect(
  location: string | null | undefined,
  setCookie: string | null | undefined,
  isTrusted: (url: string) => boolean,
): string | null {
  if (!location || !setCookie) return null;
  let url: URL;
  try {
    url = new URL(location);
  } catch {
    return null;
  }
  if (url.protocol === "http:" || url.protocol === "https:") return null;
  if (!isTrusted(location)) return null;
  url.searchParams.set("cookie", setCookie);
  return url.toString();
}

const nativeAuthorizationProxy = createAuthEndpoint(
  "/native-authorization-proxy",
  {
    method: "GET",
    query: z.object({
      authorizationURL: z.string(),
      oauthState: z.string().optional(),
    }),
    metadata: { isAction: false },
  },
  async (ctx) => {
    const { authorizationURL, oauthState } = ctx.query;
    if (authorizationURL.includes("#")) {
      throw new APIError("BAD_REQUEST", { message: "Invalid authorizationURL" });
    }
    let url: URL;
    try {
      url = new URL(authorizationURL);
    } catch {
      throw new APIError("BAD_REQUEST", { message: "Invalid authorizationURL" });
    }
    // Solo hacia proveedores externos por https; nunca hacia nosotros mismos.
    if (url.protocol !== "https:" || url.origin === new URL(ctx.context.baseURL).origin) {
      throw new APIError("BAD_REQUEST", { message: "Invalid authorizationURL" });
    }
    if (oauthState) {
      const cookie = ctx.context.createAuthCookie("oauth_state", { maxAge: 600 });
      ctx.setCookie(cookie.name, oauthState, cookie.attributes);
      return ctx.redirect(authorizationURL);
    }
    const state = url.searchParams.get("state");
    if (!state) throw new APIError("BAD_REQUEST", { message: "Unexpected error" });
    const stateCookie = ctx.context.createAuthCookie("state", { maxAge: 300 });
    await ctx.setSignedCookie(stateCookie.name, state, ctx.context.secret, stateCookie.attributes);
    return ctx.redirect(authorizationURL);
  },
);

export const nativeApp = () =>
  ({
    id: "native-app",
    async onRequest(request) {
      if (request.headers.get("origin")) return;
      const nativeOrigin = request.headers.get(NATIVE_ORIGIN_HEADER);
      if (!nativeOrigin) return;
      // NextRequest deja mutar sus cabeceras; un Request inmutable no, y tampoco
      // acepta clonarse con `new Request(nextRequest)`, así que se reconstruye.
      try {
        request.headers.set("origin", nativeOrigin);
        return { request };
      } catch {
        const headers = new Headers(request.headers);
        headers.set("origin", nativeOrigin);
        return {
          request: new Request(request.url, {
            method: request.method,
            headers,
            body: request.body,
            // @ts-expect-error -- necesario para cuerpos en streaming en Node.
            duplex: "half",
          }),
        };
      }
    },
    hooks: {
      after: [
        {
          matcher(context) {
            return !!(
              context.path?.startsWith("/callback") ||
              context.path?.startsWith("/verify-email")
            );
          },
          handler: createAuthMiddleware(async (ctx) => {
            const headers = ctx.context.responseHeaders;
            const next = withCookieInNativeRedirect(
              headers?.get("location"),
              headers?.get("set-cookie"),
              (u) => ctx.context.isTrustedOrigin(u),
            );
            if (next) ctx.setHeader("location", next);
          }),
        },
      ],
    },
    endpoints: { nativeAuthorizationProxy },
  }) satisfies BetterAuthPlugin;
