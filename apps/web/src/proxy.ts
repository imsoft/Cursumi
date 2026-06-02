import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Proxy para Next.js 16+
 * Protege rutas verificando la existencia de una cookie de sesión
 * 
 * ⚠️ IMPORTANTE: Esta verificación solo comprueba la existencia de la cookie,
 * NO valida la sesión. Siempre valida la sesión en cada página/ruta protegida.
 */
export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const pathname = request.nextUrl.pathname;

  // Rutas que requieren autenticación (cookie presente; el layout valida la sesión real)
  const protectedRoutes = ["/dashboard", "/instructor", "/admin", "/business"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Si es una ruta protegida y no hay cookie de sesión, redirigir al login.
  // (Guarda rápida en el edge; el layout valida la sesión real.)
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // NOTA: No redirigimos las rutas públicas (/, /login, /signup…) al dashboard
  // basándonos solo en la existencia de la cookie. Esa comprobación optimista,
  // combinada con la validación real de sesión en los layouts, provocaba un
  // bucle de redirecciones (ERR_TOO_MANY_REDIRECTS) cuando la cookie existía
  // pero la sesión era inválida/vencida. Las páginas públicas ya redirigen al
  // dashboard por su cuenta usando la sesión validada (getSessionSafe).

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (logos, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

