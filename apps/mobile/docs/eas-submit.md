# Entrega a tiendas (EAS Submit)

Config en [`eas.json`](../eas.json) → `submit.production`. Este doc lista lo que hay
que llenar (valores que dependen de tus cuentas de Apple / Google) y los comandos.

## Prerrequisitos comunes

- App creada en cada tienda con el mismo identificador que `app.json`:
  - iOS `bundleIdentifier`: `com.cursumi.app`
  - Android `package`: `com.cursumi.app`
- Un build de producción subido: `eas build --platform all --profile production`

## iOS — App Store Connect

Reemplaza en `eas.json` → `submit.production.ios`:

- `ascAppId`: el **Apple ID de la app** (numérico) que aparece en App Store Connect →
  tu app → App Information → "Apple ID". Ej: `6478912345`.
- `appleTeamId`: tu **Team ID** de 10 caracteres (Apple Developer → Membership). Ej: `A1B2C3D4E5`.

El login de Apple es interactivo: EAS te pedirá tu Apple ID / contraseña / 2FA al enviar
(o usa una App Store Connect API Key para CI, ver más abajo).

```bash
eas submit --platform ios --profile production
```

## Android — Google Play

1. En Google Play Console crea una **cuenta de servicio** con permiso de release y
   descarga su JSON.
2. Guárdalo en `apps/mobile/credentials/google-play-service-account.json`
   (la carpeta `credentials/` ya está en `.gitignore` — **no lo subas al repo**).

Config actual:
- `track: "internal"` — sube a la pista de pruebas internas primero. Cámbialo a
  `production` cuando estés listo para publicar.
- `releaseStatus: "draft"` — la primera subida a Play **debe** ser manual/borrador;
  después puedes quitar esta línea para publicaciones automáticas.

```bash
eas submit --platform android --profile production
```

## CI / no interactivo (opcional)

Para iOS sin prompt, crea una App Store Connect API Key y expórtala como secrets de EAS
(`EXPO_ASC_API_KEY_PATH`, etc.) o guárdala con `eas credentials`. Ver
https://docs.expo.dev/submit/ios/.
