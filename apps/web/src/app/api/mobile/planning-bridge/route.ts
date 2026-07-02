import { NextRequest, NextResponse } from "next/server";
import { getSessionSafe } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Puente de sesión para la app móvil (Cursumi para iOS/Android).
 *
 * La app abre la sección de planeación dentro de un WebView. El cliente móvil
 * envía la cookie de sesión de better-auth en la cabecera `Cookie` de la carga
 * inicial, pero esa cabecera NO se guarda en el "cookie jar" del WebView, así
 * que las peticiones posteriores (autoguardado, marcar completado) irían sin
 * sesión.
 *
 * Este endpoint recibe esa carga inicial autenticada y RE-EMITE las cookies de
 * better-auth con `Set-Cookie` para que queden persistidas en el WebView; luego
 * redirige a la página de planeación real. A partir de ahí todas las peticiones
 * del WebView llevan la sesión.
 *
 * `redirect` se restringe a rutas internas de planeación para evitar open-redirect.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const requested = url.searchParams.get("redirect") ?? "";
  const safePath =
    /^\/instructor\/courses\/[^/?#]+\/planning(?:\/[^?#]*)?$/.test(requested)
      ? requested
      : "/instructor";

  const session = await getSessionSafe();
  const target = new URL(session ? safePath : "/login", url.origin);
  const res = NextResponse.redirect(target, 303);

  if (session) {
    // Persistimos las cookies de sesión de better-auth en el jar del WebView.
    const cookieHeader = req.headers.get("cookie") ?? "";
    for (const part of cookieHeader.split(";")) {
      const eq = part.indexOf("=");
      if (eq === -1) continue;
      const name = part.slice(0, eq).trim();
      const value = part.slice(eq + 1).trim();
      if (!name.includes("better-auth")) continue;
      res.cookies.set(name, value, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
    }
  }

  return res;
}
