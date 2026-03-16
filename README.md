# Cursumi

Plataforma de cursos virtuales y presenciales: estudiantes exploran e inscriben cursos, instructores publican y cobran, administradores gestionan la plataforma.

**Stack:** Next.js 16 (App Router), React 19, Better Auth, Neon (Prisma), shadcn/ui + Tailwind v4. Video con Mux, imágenes con Cloudinary, pagos con Stripe.

---

## Requisitos

- Node 20+
- pnpm
- Variables de entorno en `.env` (usa `.env.example` como referencia)

## Setup rápido

1. Copia `.env.example` a `.env` y completa:
   - **Base de datos:** `DATABASE_URL` (Neon; usa conexión directa para migraciones)
   - **Auth:** `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL` (ej. `http://localhost:3000` o `https://cursumi.com`)
   - **Email:** Resend — `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
   - **OAuth:** Google — `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - **Video:** Mux — `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`
   - **Imágenes:** Cloudinary — `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_PRESET`
   - **Pagos:** Stripe — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (y Stripe Connect para instructores)
2. Instala dependencias: `pnpm install`
3. Prisma: `pnpm db:generate` y luego `pnpm prisma migrate deploy` (o `pnpm db:push` en desarrollo)
4. (Opcional) Poblado inicial: `pnpm db:seed`
5. Arranca: `pnpm dev`

## Scripts

| Comando | Descripción |
|--------|-------------|
| `pnpm dev` | Desarrollo con Turbopack |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción |
| `pnpm lint` | Linting |
| `pnpm db:generate` | Genera Prisma Client |
| `pnpm db:push` | Sincroniza schema con la BD (dev) |
| `pnpm db:migrate` | Crea/aplica migraciones |
| `pnpm db:studio` | Abre Prisma Studio |
| `pnpm db:seed` | Ejecuta seed |

## Integraciones

- **Auth:** Better Auth — email/contraseña y Google. Rutas en `/api/auth/*`.
- **Base de datos:** Prisma + Neon. Cursos, secciones, lecciones, inscripciones, certificados, transacciones, notificaciones.
- **Video:** Mux — subida y reproducción; `/api/mux/*`.
- **Imágenes:** Cloudinary — firma de subida en `/api/cloudinary/signature`.
- **Pagos:** Stripe (checkout) y Stripe Connect (pagos a instructores). Webhook en `/api/payments/webhook`.

## Rutas principales por rol

- **Público:** `/`, `/courses`, `/courses/[id]`, `/how-it-works`, `/instructors`, `/contact`, `/login`, `/signup`
- **Estudiante:** `/dashboard`, `/dashboard/explore`, `/dashboard/my-courses`, `/dashboard/certificates`, `/dashboard/account` (perfil y configuración)
- **Instructor:** `/instructor`, `/instructor/courses`, `/instructor/earnings`, `/instructor/analytics`, `/instructor/profile`
- **Admin:** `/admin`, `/admin/users`, `/admin/courses`, `/admin/analytics`, `/admin/finances`, `/admin/categories`, etc.

## Despliegue y operación

- Usa la conexión **directa** de Neon para `migrate deploy`; en runtime puede usarse el pooler.
- Cookies de sesión por dominio: si el sitio se sirve en `www` y sin `www`, configura `trustedOrigins` en Better Auth para ambos.
- OG dinámico por curso: `/api/og/course/[id]`.
