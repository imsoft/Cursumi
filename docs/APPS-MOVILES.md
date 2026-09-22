# Apps móviles de Cursumi: instalar y correr

Cursumi tiene dos apps nativas en este monorepo:

| App | Carpeta | Lenguaje | Mínimo | Documento propio |
|---|---|---|---|---|
| iOS | `apps/ios` | Swift + SwiftUI | iOS 17 | [apps/ios/README.md](../apps/ios/README.md) |
| Android | `apps/android` | Kotlin + Jetpack Compose | Android 8 (API 26) | [apps/android/README.md](../apps/android/README.md) |

Las dos consumen la API de la web (`apps/web`) en **`https://cursumi.com`** por
defecto: al correrlas entras con tu cuenta real de Cursumi, contra producción.
No necesitan la web corriendo en tu compu. Ninguna vende dentro de la app
(modelo *reader app*): la ficha del curso se abre en el navegador.

Esta guía es para correrlas en tu Mac y en tu celular. Publicarlas en las
tiendas es otro proceso y por ahora no se hace.

---

## 1. Requisitos (una sola vez)

### Para iOS

1. **Xcode** desde la App Store (versión 26 o superior; el proyecto se hizo con
   Xcode 27). Ábrelo una vez para que instale sus componentes.
2. **Herramientas de línea de comandos**: `xcode-select --install` (si Xcode no
   las instaló ya).
3. **XcodeGen**, que genera el proyecto de Xcode a partir de `project.yml`:
   ```bash
   brew install xcodegen
   ```
   (Si no tienes Homebrew: https://brew.sh)

No hace falta cuenta de pago de Apple para el simulador ni para tu iPhone.

### Para Android

1. **Android Studio** (https://developer.android.com/studio). Al instalarlo
   acepta el SDK que propone; después, en **Settings → Languages & Frameworks →
   Android SDK**, asegúrate de tener marcado **Android 15 (API 37)** o el más
   reciente; la app compila contra la API 37.
2. Android Studio ya trae su propio Java (JBR). Los comandos de terminal lo
   necesitan como `JAVA_HOME`:
   ```bash
   export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
   ```
   Para no escribirlo cada vez, agrégalo al final de `~/.zshrc`.
3. Un **emulador**: en Android Studio → **Device Manager → Create device**, elige
   un Pixel (p. ej. Pixel 9 Pro XL) con una imagen que diga **Google Play** (sin
   eso no hay Chrome ni notificaciones push). En esta Mac ya existe el
   `Pixel_9_Pro_XL`.

### Común

- El repo clonado y `pnpm install` hecho una vez en la raíz (solo lo necesita la
  web; las apps no dependen de Node, pero así el repo queda completo).

---

## 2. iOS en el simulador

```bash
cd ~/Proyectos/cursumi/apps/ios
xcodegen generate        # crea Cursumi.xcodeproj (no se versiona; se regenera cuando quieras)
open Cursumi.xcodeproj
```

En Xcode:

1. Arriba, junto al botón ▶, elige un simulador (por ejemplo **iPhone 17 Pro**).
2. ▶ o ⌘R. La primera compilación tarda 1–3 minutos; las siguientes, segundos.
3. El simulador abre solo con la app dentro.

Repite `xcodegen generate` cada vez que cambies `project.yml` o agregues/quites
archivos Swift desde fuera de Xcode (por ejemplo, tras un `git pull` con archivos
nuevos). Si Xcode muestra archivos en rojo, es eso.

Desde la terminal, sin abrir Xcode:

```bash
xcodebuild build -project Cursumi.xcodeproj -scheme Cursumi \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' CODE_SIGNING_ALLOWED=NO
```

## 3. iOS en tu iPhone

1. En Xcode → **Settings → Accounts**, agrega tu Apple ID (el normal, sin pagar
   nada). Eso crea un *Personal Team*.
2. En el proyecto: target **Cursumi → Signing & Capabilities → Team**: elige tu
   Personal Team. Xcode gestiona el perfil solo.
3. Conecta el iPhone por cable, desbloquéalo y confía en la computadora.
4. Elige el iPhone como destino y ▶.
5. La primera vez el iPhone bloquea la app: **Ajustes → General → VPN y gestión
   de dispositivos → tu Apple ID → Confiar**. Vuelve a abrirla.

Con Personal Team la app caduca a los **7 días**; basta con volver a darle ▶ desde
Xcode. Máximo 3 apps instaladas así a la vez.

Si Xcode se queja de la capacidad *Push Notifications* (el Personal Team no la
permite), quita el bloque `entitlements` de `apps/ios/project.yml`, corre
`xcodegen generate` otra vez y listo; la app funciona igual, solo sin push.

## 4. Android en el emulador

Opción A, con Android Studio:

```bash
open -a "Android Studio" ~/Proyectos/cursumi/apps/android
```

Espera a que termine "Gradle sync" (barra inferior), elige el emulador arriba y ▶.
La primera vez descarga dependencias (2–5 minutos).

Opción B, desde la terminal:

```bash
# 1. arranca el emulador (se queda abierto; usa otra pestaña de terminal)
~/Library/Android/sdk/emulator/emulator -avd Pixel_9_Pro_XL &

# 2. cuando veas la pantalla de inicio del Pixel, instala la app
cd ~/Proyectos/cursumi/apps/android
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
./gradlew :app:installDebug
```

`installDebug` **solo instala**: abre la app desde el cajón de apps del emulador
(desliza hacia arriba) o con:

```bash
~/Library/Android/sdk/platform-tools/adb shell am start -n com.cursumi.app/.MainActivity
```

Para ver los nombres de tus emuladores: `~/Library/Android/sdk/emulator/emulator -list-avds`.

## 5. Android en tu teléfono

1. En el teléfono: **Ajustes → Acerca del teléfono → toca 7 veces "Número de
   compilación"**. Aparece **Opciones de desarrollador**; ahí activa **Depuración
   USB**.
2. Conéctalo por cable y acepta "Permitir depuración USB" en el teléfono.
3. Comprueba que se ve: `~/Library/Android/sdk/platform-tools/adb devices` debe
   listarlo como `device`.
4. `./gradlew :app:installDebug` (o ▶ en Android Studio con el teléfono elegido).
   Si hay emulador y teléfono a la vez, Gradle instala en ambos.

Sin cable también sirve: Android 11+ permite **Depuración inalámbrica** en las
mismas Opciones de desarrollador (`adb pair` con el código que muestra).

---

## 6. Qué funciona en cada entorno

| | Simulador iOS | iPhone | Emulador Android (con Google Play) | Android real |
|---|---|---|---|---|
| Entrar con correo / Google / 2FA | ✅ | ✅ | ✅ | ✅ |
| Cursos, lecciones, video, quizzes, chat, planeación | ✅ | ✅ | ✅ | ✅ |
| Subir foto / video (Mux) | ✅ (fotos del simulador) | ✅ | ✅ | ✅ |
| Notificaciones push | ❌ Apple no lo soporta | ❌ hasta tener la clave APNs de una cuenta de desarrollador de pago | ✅ | ✅ |

Push en Android ya está activo del lado del servidor (Firebase / FCM). Push en
iOS requiere el Apple Developer Program (99 USD/año); ver el README de iOS.

## 7. Apuntar a un servidor local (opcional)

Solo si estás cambiando la web y quieres probarla desde la app. Levanta la web
con `pnpm dev` en la raíz y:

- **iOS**: en Xcode, **Product → Scheme → Edit Scheme → Run → Arguments →
  Environment Variables**: `CURSUMI_API_URL` = `http://localhost:3000`
  (el simulador comparte la red de la Mac; en un iPhone físico usa la IP de tu
  Mac, p. ej. `http://192.168.1.20:3000`).
- **Android**: `./gradlew :app:installDebug -Pcursumi.apiUrl=http://10.0.2.2:3000`
  (`10.0.2.2` es "la Mac" visto desde el emulador; en un teléfono físico, la IP
  de tu Mac).

Ojo: el login con Google y Turnstile están atados al dominio de producción, así
que contra local usa correo y contraseña.

## 8. Actualizar tras un `git pull`

- **iOS**: `cd apps/ios && xcodegen generate`, luego ⌘R en Xcode.
- **Android**: ▶ en Android Studio, o `./gradlew :app:installDebug`. Si cambió
  `build.gradle.kts`, Android Studio pedirá "Sync now": acéptalo.

## 9. Pruebas

```bash
# iOS (38 pruebas: cookies, modelos, quizzes, formato)
cd apps/ios && xcodebuild test -project Cursumi.xcodeproj -scheme Cursumi \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' CODE_SIGNING_ALLOWED=NO

# Android (16 pruebas)
cd apps/android && ./gradlew :app:testDebugUnitTest
```

El CI de GitHub (`.github/workflows/ci.yml`) compila y prueba las dos apps en
cada PR, así que si CI está en verde, `main` compila.

---

## 10. Errores frecuentes

| Mensaje | Qué es | Solución |
|---|---|---|
| `No connected devices!` (Android) | No hay emulador encendido ni teléfono conectado | Arranca el emulador o conecta el teléfono con depuración USB y repite |
| `xcodegen: command not found` | Falta XcodeGen | `brew install xcodegen` |
| Xcode: archivos en rojo / "Build input file cannot be found" | El `.xcodeproj` está desactualizado | `xcodegen generate` y vuelve a abrir |
| Xcode: "Signing for Cursumi requires a development team" | No elegiste equipo | Signing & Capabilities → Team → tu Apple ID |
| iPhone: "Untrusted Developer" | Primera instalación con Personal Team | Ajustes → General → VPN y gestión de dispositivos → Confiar |
| `Application failed preflight checks (Busy)` al correr pruebas iOS | La app quedó abierta en el simulador de una corrida anterior | Cierra la app en el simulador (o `xcrun simctl terminate booted com.cursumi.app`) |
| Gradle: `JAVA_HOME is not set` o versión de Java incorrecta | Falta el JDK en la terminal | `export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"` |
| Gradle: `SDK location not found` | Falta `local.properties` | Crea `apps/android/local.properties` con `sdk.dir=/Users/TU_USUARIO/Library/Android/sdk` (Android Studio lo crea solo al abrir el proyecto) |
| Gradle: `requires libraries … compile against version 37` | SDK viejo | Android Studio → SDK Manager → instala la API 37 |
| "Continuar con Google" no abre nada (Android) | Emulador sin navegador | Usa una imagen con Google Play, o entra con correo y contraseña |
| La app abre pero todo dice "No se pudo cargar" | Sin internet o `cursumi.com` caído | Revisa la conexión; las apps van contra producción |
| Login OK en la app pero no en el emulador con teclado | El emulador lento se come teclas | Escribe despacio o pega el texto (⌘V funciona en el emulador) |

---

## 11. Cómo se hablan con el servidor (para cuando toques la web)

- Cada petición a `/api/*` lleva la cookie de sesión de better-auth en la
  cabecera `Cookie`. Las apps la guardan en el llavero (iOS) o en preferencias
  privadas (Android).
- En `/api/auth/*` mandan además `x-native-origin: mobile://`. El plugin
  `native-app` del servidor ([apps/web/src/lib/auth-native-app.ts](../apps/web/src/lib/auth-native-app.ts))
  lo copia a `Origin`, expone `/api/auth/native-authorization-proxy` para el
  login con Google y devuelve la sesión al deep link `mobile://?cookie=…`.
- Push: `POST /api/me/push-token` con `apns:<token>` (iOS) o `fcm:<token>`
  (Android). El servidor envía por APNs ([apns-push.ts](../apps/web/src/lib/apns-push.ts))
  y FCM ([fcm-push.ts](../apps/web/src/lib/fcm-push.ts)).
- La planeación didáctica del instructor reutiliza los editores de la web dentro
  de un WebView; la web detecta `window.CursumiNative` para ocultar su barra y
  entregar el PDF a la app.
