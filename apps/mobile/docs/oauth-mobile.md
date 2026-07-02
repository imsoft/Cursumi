# OAuth con Google en la app móvil

Estado: **el código está correcto y alineado.** El único pendiente es validar el
deep-link en un **build real** (no Expo Go) y confirmar la config de Google fuera del repo.

## Cómo funciona el flujo

1. El usuario toca "Continuar con Google" → `signIn.social({ provider: "google" })`
   ([`auth-screen.tsx`](../src/components/auth-screen.tsx)).
2. El cliente `@better-auth/expo` abre el navegador (`expo-web-browser`).
3. Google autentica y redirige al callback **de la web**:
   `https://www.cursumi.com/api/auth/callback/google`.
4. `better-auth` (plugin `expo()`) redirige de vuelta a la app por el scheme `mobile://`
   con el token de sesión.
5. El token se guarda en `SecureStore`; `useSession()` re-renderiza y muestra la app
   ([`_layout.tsx`](../src/app/_layout.tsx)).

## Verificado en código (no tocar)

| Pieza | Dónde |
|---|---|
| `scheme: "mobile"` coincide en app y cliente | `app.json` ↔ `src/lib/auth.ts` |
| Servidor confía en el deep-link (`origins.add("mobile://")`) | `apps/web/src/lib/auth.ts` (`getTrustedOrigins`) |
| Plugin `expo()` en el servidor | `apps/web/src/lib/auth.ts` |
| Deps: `expo-web-browser`, `expo-linking`, `expo-secure-store` | `package.json` |
| Provider Google (condicional a env) | `apps/web/src/lib/auth.ts` (`socialProviders`) |

## Por qué NO funciona en Expo Go

En Expo Go el scheme activo es `exp://`, no `mobile://`, así que el redirect de vuelta
no engancha. **Solo se valida en dev-client o build standalone.** No es un bug del código.

## Config externa a confirmar

1. **Google Cloud Console** → OAuth client → *Authorized redirect URIs* debe incluir
   el callback **web** (el móvil reusa el mismo):
   ```
   https://www.cursumi.com/api/auth/callback/google
   ```
   Si el login con Google en la web funciona, esto ya está listo.
2. **Env del servidor de producción**: `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.
   Si faltan, el bloque `socialProviders` no se monta y el botón falla con el mensaje
   genérico de error.

## Checklist de prueba en dispositivo

```bash
# 1. Build de dev-client (activa el scheme mobile://, a diferencia de Expo Go)
eas build --profile development --platform android   # o ios

# 2. Instalar en el dispositivo, abrir, tocar "Continuar con Google"
# 3. Debe volver a la app y entrar directo (Google trae el email ya verificado)
# 4. Cerrar y reabrir la app → debe seguir con la sesión (token en SecureStore)
```

**Si el navegador se queda abierto y no vuelve a la app:** casi siempre es (a) el redirect
URI de Google mal configurado, o (b) se probó en Expo Go en vez de un build nativo.
