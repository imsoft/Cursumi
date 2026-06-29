import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Proxy para Next.js 16+ (antes "middleware").
 *
 * Dos responsabilidades:
 *  1. Guarda rápida de auth en el edge (solo comprueba la cookie; el layout valida
 *     la sesión real).
 *  2. Content-Security-Policy estricta basada en un nonce por request: elimina
 *     `'unsafe-inline'` de los scripts. Solo se ejecutan los scripts con el nonce
 *     (Next lo aplica a los suyos al leer la CSP del header del request) y los que
 *     estos carguen vía `'strict-dynamic'`.
 *
 * Notas CSP:
 *  - `'unsafe-eval'` se mantiene (lo requieren Next/HMR y algunas libs).
 *  - Los hosts (Stripe, Turnstile) son fallback para navegadores CSP2 sin
 *    `'strict-dynamic'`; en CSP3 se ignoran y la confianza se propaga por nonce.
 *  - `style-src` mantiene `'unsafe-inline'` (estilos inline de Next/Tailwind).
 *  - JSON-LD (`application/ld+json`) es un data block: CSP no lo bloquea.
 */
function buildCsp(nonce: string): string {
  const isProd = process.env.NODE_ENV === "production";
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' blob: https://challenges.cloudflare.com https://js.stripe.com`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https://images.unsplash.com https://res.cloudinary.com https://image.mux.com https://*.googleusercontent.com`,
    `media-src 'self' blob: data: https://stream.mux.com`,
    `worker-src 'self' blob:`,
    `connect-src 'self' blob: https://challenges.cloudflare.com https://api.stripe.com https://api.cloudinary.com *.sentry.io https://storage.googleapis.com https://*.storage.googleapis.com https://*.googleapis.com https://api.mux.com https://upload.mux.com https://*.mux.com`,
    `frame-src 'self' https://challenges.cloudflare.com https://js.stripe.com`,
    `font-src 'self' data:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    ...(isProd ? [`upgrade-insecure-requests`] : []),
  ].join("; ");
}

export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  const sessionCookie = getSessionCookie(request);
  const pathname = request.nextUrl.pathname;

  // Rutas que requieren autenticación (cookie presente; el layout valida la sesión real)
  const protectedRoutes = ["/dashboard", "/instructor", "/admin", "/business"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Si es una ruta protegida y no hay cookie de sesión, redirigir al login.
  if (isProtectedRoute && !sessionCookie) {
    const redirect = NextResponse.redirect(new URL("/login", request.url));
    redirect.headers.set("Content-Security-Policy", csp);
    return redirect;
  }

  // NOTA: No redirigimos las rutas públicas (/, /login, /signup…) al dashboard
  // basándonos solo en la existencia de la cookie. Las páginas públicas ya
  // redirigen al dashboard por su cuenta usando la sesión validada (getSessionSafe).

  // El nonce y la CSP van en los headers del REQUEST para que Next aplique el
  // nonce a sus propios scripts durante el render.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    /*
     * Todas las rutas excepto API y assets estáticos (la CSP no aplica a JSON/binarios).
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
