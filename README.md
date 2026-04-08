# Cursumi

Plataforma de cursos virtuales, presenciales y en vivo: estudiantes exploran e inscriben cursos, instructores publican y cobran, administradores gestionan la plataforma. Incluye dashboard para organizaciones (B2B), pizarrón virtual para instructores y catálogo de ubicaciones en México (estado y municipio INEGI) en formularios de perfil y cursos presenciales.

**Stack:** Next.js 16 (App Router), React 19, Better Auth, Neon + Prisma 7, shadcn/ui + Tailwind CSS v4. Video con Mux, imágenes con Cloudinary, pagos con Stripe (Connect para instructores).

---

## Requisitos

- **Node.js** 20+
- **pnpm** (gestor de paquetes del proyecto)
- Archivo **`.env`** en la raíz (puedes partir de `.env.example` si lo añades al repo)

---

## Setup rápido

1. **Variables de entorno** — copia `.env.example` a `.env` (o créalo) y completa al menos:

   | Área | Variables |
   |------|-----------|
   | **Base de datos** | `DATABASE_URL` — Neon; usa conexión **directa** para migraciones (`prisma migrate`). |
   | **Auth (obligatorio)** | `BETTER_AUTH_SECRET` (mín. 32 caracteres; p. ej. `openssl rand -base64 32`), `NEXT_PUBLIC_APP_URL` (URL pública **sin** barra final, p. ej. `http://localhost:3000` o `https://www.cursumi.com`). Opcional: `BETTER_AUTH_URL` si difiere de `NEXT_PUBLIC_APP_URL` en el servidor. |
   | **OAuth Google (opcional)** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Si faltan, el login/registro por email sigue funcionando y el botón de Google no se muestra. En Google Cloud Console, redirect URI: `https://TU-DOMINIO/api/auth/callback/google`. |
   | **Email** | Resend: `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (verificación de correo y recuperación de contraseña). |
   | **Seguridad registro / forgot password** | Cloudflare Turnstile: `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Si no configuras el secret, el servidor omite la verificación CAPTCHA en desarrollo. |
   | **Rate limiting (opcional)** | Upstash Redis: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — usado en hooks propios de auth (no sustituye el almacenamiento interno de rate limit de Better Auth). |
   | **Video** | Mux: `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET` |
   | **Imágenes** | Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (y preset si aplica) |
   | **Pagos** | Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (+ variables de Stripe Connect para instructores según tu entorno) |

2. **Dependencias:** `pnpm install` (ejecuta `prisma generate` en `postinstall`).

3. **Base de datos:** `pnpm db:generate` y luego `pnpm prisma migrate deploy` en producción (o `pnpm db:migrate` / `pnpm db:push` en desarrollo).

4. **(Opcional)** Datos iniciales: `pnpm db:seed`

5. **Desarrollo:** `pnpm dev` (Turbopack). **Producción local:** `pnpm build` y `pnpm start`.

---

## Scripts

| Comando | Descripción |
|--------|-------------|
| `pnpm dev` | Servidor de desarrollo (Turbopack) |
| `pnpm build` | Build de producción (Next sin Turbopack, según `package.json`) |
| `pnpm start` | Servidor Node tras el build |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Genera el cliente Prisma (`src/generated/prisma`) |
| `pnpm db:push` | Sincroniza el schema con la BD (solo desarrollo rápido) |
| `pnpm db:migrate` | Crea o aplica migraciones (`prisma migrate dev`) |
| `pnpm db:studio` | Prisma Studio |
| `pnpm db:seed` | Ejecuta `prisma/seed.ts` |

---

## Integraciones

- **Autenticación:** Better Auth — email/contraseña (verificación de email obligatoria), Google opcional. API en `/api/auth/*`. Cookies y CSRF dependen de que `NEXT_PUBLIC_APP_URL` coincida con el dominio real; en Vercel también se considera `VERCEL_URL` para orígenes de confianza.
- **Base de datos:** Prisma + PostgreSQL (Neon). Modelos: usuarios, cursos, modalidades (virtual, presencial, live), sesiones con `meetingUrl` en vivo, inscripciones, certificados, transacciones, notificaciones, organizaciones (B2B), etc.
- **Video:** Mux — subida y reproducción; rutas `/api/mux/*`.
- **Imágenes:** Cloudinary — avatares y portadas; firma en `/api/cloudinary/signature`.
- **Pagos:** Stripe (checkout) y Stripe Connect (liquidación a instructores). Webhook: `/api/payments/webhook`.

---

## Rutas principales por rol

- **Público:** `/`, `/courses`, `/courses/[slug]`, `/how-it-works`, `/instructors`, `/contact`, `/login`, `/signup`, `/verify-email`, `/forgot-password`
- **Estudiante:** `/dashboard`, `/dashboard/explore`, `/dashboard/my-courses`, `/dashboard/certificates`, `/dashboard/account`, `/dashboard/games`, …
- **Instructor:** `/instructor`, `/instructor/courses`, `/instructor/whiteboard`, `/instructor/earnings`, `/instructor/analytics`, `/instructor/profile`, `/instructor/games`, …
- **Admin:** `/admin` y subrutas (usuarios, cursos, analytics, finanzas, categorías, cupones, …)
- **Empresa (B2B):** `/business/dashboard`, equipos, materiales, métricas, …

---

## Despliegue y buenas prácticas

- **Neon:** Usa la URL **directa** para `prisma migrate deploy`; en runtime el **pooler** suele ser adecuado.
- **Dominio único:** Evita mezclar `www` y apex sin configurar ambos en variables y en la consola de OAuth; la app añade variantes `www` / sin `www` a orígenes de confianza cuando la URL base está bien definida.
- **Open Graph:** Imagen dinámica por curso en `/api/og/course/[id]`.
- **Sentry / analítica:** Configuradas según variables del entorno de despliegue (Vercel, etc.).

---

## Licencia y contribución

Uso privado del proyecto salvo que se indique lo contrario. Para cambios estructurales (auth, pagos, schema), revisa migraciones Prisma y variables en staging antes de producción.
