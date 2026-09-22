# Cursumi Android (Kotlin + Jetpack Compose)

App nativa de Android. Consume la misma API que la web (`apps/web`) y trata al
servidor exactamente igual que la app Expo y la de iOS: misma cookie de sesión,
mismo origen `mobile://`. No hace falta cambiar nada del lado del servidor.

## Requisitos

- Android Studio (trae el JDK) o un JDK 17+.
- SDK de Android con `platforms;android-37` (la app compila contra 37, corre desde Android 8 / API 26).

## Cómo correrla

```bash
cd apps/android
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"  # o tu JDK
./gradlew :app:assembleDebug          # APK en app/build/outputs/apk/debug/
./gradlew :app:testDebugUnitTest      # pruebas unitarias
```

O abre `apps/android` en Android Studio y dale a Run.

Para apuntar a un servidor local: `./gradlew :app:assembleDebug -Pcursumi.apiUrl=http://10.0.2.2:3000`.

## Estructura

```
app/src/main/java/com/cursumi/app/
  CursumiApp.kt        Composición de dependencias (ApiClient, AuthService, SessionStore, APIs)
  MainActivity.kt      Arranque + vuelta del deep link de Google (mobile://?cookie=…)
  core/
    Config.kt          API_URL, site key de Turnstile, scheme
    Formatting.kt      Precio MXN, iniciales, fuente de video, HTML de lección, slug
    api/               ApiClient (OkHttp + cookie), StudentApi, SocialApi, InstructorApi, AdminApi
    auth/              CookieJar (cookies better-auth en SharedPreferences), AuthService, SessionStore
    model/             Formas de la API (kotlinx.serialization)
    ui/                Theme (paleta de marca), Components
  ui/
    Root.kt            Navegación (navigation-compose) y pestañas
    auth/              Acceso, registro con Turnstile, 2FA, recuperar contraseña
    courses/           Mis cursos, detalle, lección (ExoPlayer/WebView), quizzes, examen, tarea,
                       minijuegos, chat, notas, reflexiones, reseñas
    catalog/           Explorar (la ficha abre en Custom Tabs: modelo reader app)
    profile/           Perfil, notificaciones, certificados, deseos, notas, juegos, referidos,
                       materiales, blog, configuración, ser instructor
    instructor/        Panel, perfil + Stripe, crear curso (subida a Mux), anfitrión de juegos,
                       pizarrón, plantillas, empresas, planeación en WebView
    admin/             Los 10 apartados del admin
app/src/test/          Pruebas unitarias (JUnit 4)
```

## Autenticación

- **Correo y contraseña**: `POST /api/auth/sign-in/email`; con 2FA se pide el TOTP.
- **Google**: `POST /api/auth/sign-in/social` → se abre en Custom Tabs vía
  `/api/auth/expo-authorization-proxy`; el servidor termina en `mobile://?cookie=…`,
  que `MainActivity` recibe por el intent-filter del scheme `mobile`.
- **Registro y recuperar contraseña**: exigen el token de Turnstile, obtenido en un
  `WebView` mínimo con interfaz JS.
- La cookie de sesión vive en preferencias privadas de la app (`CookieJar`) y viaja
  en la cabecera `Cookie`. OkHttp no gestiona cookies: así nunca salen del dominio.

## Planeación didáctica

Se reutilizan los editores de la web dentro de un `WebView`. La interfaz JS se llama
`ReactNativeWebView` (igual que en React Native), así la web oculta su chrome y
entrega el PDF por `postMessage` sin cambios; el PDF se comparte con `FileProvider`.

## Push

Pendiente: en Android las push nativas van por FCM, que necesita un proyecto de
Firebase (`google-services.json`) y un envío desde el servidor. Ver [[app-nativa-swift-kotlin]]
en la memoria del proyecto.

## Paridad

Completa respecto a la app Expo, salvo push.
