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

  // Rutas públicas que no deben ser accesibles si el usuario está autenticado
  const publicOnlyRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/courses",
    "/blog",
    "/how-it-works",
    "/pricing",
    "/contact",
  ];
  const isPublicOnlyRoute = publicOnlyRoutes.includes(pathname) || pathname.startsWith("/reset-password");

  // Si es una ruta protegida y no hay cookie de sesión, redirigir al login
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si es una ruta pública y hay sesión, redirigir al dashboard
  if (isPublicOnlyRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

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

