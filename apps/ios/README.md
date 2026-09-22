# Cursumi iOS (Swift + SwiftUI)

App nativa de iOS. Consume la misma API que la web (`apps/web`); del lado del
servidor solo la atiende el plugin `native-app` de better-auth
(`apps/web/src/lib/auth-native-app.ts`).

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
    Models/    Formas de la API
    UI/        Brand (paleta), Components, WebViews (Turnstile, HTML)
  Features/    Auth, MyCourses (curso, lección, quizzes, examen, tarea, minijuegos,
               chat, notas, reseñas), Catalog, Profile, Instructor (panel, perfil,
               crear curso, juegos, pizarrón, planeación en WebView), Admin
CursumiTests/  Pruebas unitarias (XCTest)
project.yml    Definición del proyecto para XcodeGen
```

## Autenticación

- **Correo y contraseña**: `POST /api/auth/sign-in/email`. Si el usuario tiene 2FA,
  el servidor responde `twoFactorRedirect` y se pide el TOTP en `TwoFactorView`.
- **Google**: `POST /api/auth/sign-in/social` → se abre la URL con
  `ASWebAuthenticationSession` a través de `/api/auth/native-authorization-proxy`
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

## Push (APNs)

La app registra el token de APNs en `POST /api/me/push-token` con el prefijo
`apns:`; el servidor lo manda por HTTP/2 (`apps/web/src/lib/apns-push.ts`).
Para activarlo hacen falta en Vercel `APNS_KEY_ID`, `APNS_TEAM_ID` y `APNS_KEY`
(clave .p8 de Apple Developer → Keys) y la capacidad Push Notifications en el
App ID. Sin eso la app funciona igual, solo sin push.

## Paridad

Completa en lo que la app cubre; push pendiente de las claves de Apple.
