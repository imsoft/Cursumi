# Cursumi iOS (Swift + SwiftUI)

App nativa de iOS. Consume la misma API que la web (`apps/web`) y trata al servidor
exactamente igual que la app Expo: misma cookie de sesión, mismo origen `mobile://`.
No hace falta cambiar nada del lado del servidor.

## Requisitos

- Xcode 27 (iOS 17+ como destino).
- [XcodeGen](https://github.com/yonaskolb/XcodeGen): `brew install xcodegen`.

## Cómo correrla

```bash
cd apps/ios
xcodegen generate      # crea Cursumi.xcodeproj a partir de project.yml (no se versiona)
open Cursumi.xcodeproj # o: xcodebuild ... (ver abajo)
```

Desde la terminal:

```bash
xcodebuild build -project Cursumi.xcodeproj -scheme Cursumi \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' CODE_SIGNING_ALLOWED=NO
xcodebuild test  -project Cursumi.xcodeproj -scheme Cursumi \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' CODE_SIGNING_ALLOWED=NO
```

Para apuntar a un servidor local, define la variable de entorno `CURSUMI_API_URL`
en el esquema de Xcode (Edit Scheme → Run → Arguments → Environment Variables).

## Estructura

```
Cursumi/
  App/         CursumiApp, RootView (sesión → login o pestañas)
  Core/
    Auth/      CookieJar (cookies better-auth en el llavero), AuthService, SessionStore
    API/       APIClient (URLSession + cookie), StudentAPI (endpoints)
    Models/    Formas de la API (espejo de apps/mobile/src/lib/me.ts)
    UI/        Brand (paleta), Components, WebViews (Turnstile, HTML)
  Features/    Auth, MyCourses, Catalog, Profile
CursumiTests/  Pruebas unitarias (XCTest)
project.yml    Definición del proyecto para XcodeGen
```

## Autenticación

- **Correo y contraseña**: `POST /api/auth/sign-in/email`. Si el usuario tiene 2FA,
  el servidor responde `twoFactorRedirect` y se pide el TOTP en `TwoFactorView`.
- **Google**: `POST /api/auth/sign-in/social` → se abre la URL con
  `ASWebAuthenticationSession` a través de `/api/auth/expo-authorization-proxy`
  (fija la cookie `state` en el navegador). El servidor termina en
  `mobile://?cookie=<Set-Cookie>` y la app guarda esa cookie.
- **Registro y recuperar contraseña**: exigen el token de Cloudflare Turnstile,
  que se obtiene con un `WKWebView` mínimo (`TurnstileView`).
- La cookie de sesión vive en el llavero (`CookieJar`) y viaja en la cabecera
  `Cookie` de cada petición a `/api/*`. Foundation no gestiona cookies: así la
  cookie nunca sale del dominio de Cursumi.

## Modelo "reader app"

La app **no vende**: la ficha del curso y los certificados se abren en Safari
(`SFSafariViewController`). Sin botón de compra ni enlace a checkout dentro de la
app, para cumplir las reglas de Apple sin pagar comisión de tienda.

## Qué falta respecto a la app Expo

Quizzes, tareas, examen final, minijuegos, chat con el instructor, notas,
reflexiones, referidos, blog, panel de instructor, panel de administración,
juegos en vivo y notificaciones push. Se van portando por fases; mientras, la app
Expo sigue viva en `apps/mobile`.
