# Cursumi · Plataforma educativa (Frontend)

Next.js 16 (App Router) + React 19 con autenticación Better Auth, base de datos en Neon (Prisma) y UI con shadcn/tailwind v4. Soporta video en Mux y subida de imágenes a Cloudinary.

## Requisitos
- Node 20+
- pnpm
- Variables de entorno (`.env`): usa `.env.example` como guía

## Setup rápido
1) Copia `.env.example` a `.env` y completa:
   - `DATABASE_URL` (Neon direct/pooler), `BETTER_AUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL` (ej: http://localhost:3000 o https://cursumi.com)
   - Resend: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
   - Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - Mux video: `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`
   - Cloudinary imágenes: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_PRESET`
2) Instala dependencias: `pnpm install`
3) Genera cliente Prisma y aplica schema: `pnpm db:generate` + `pnpm prisma migrate deploy` (usa conexión directa de Neon para migrar) o `pnpm db:push`
4) Ejecuta: `pnpm dev`

## Scripts
- `pnpm dev` – modo desarrollo (Turbopack)
- `pnpm build` / `pnpm start` – build y arranque en producción (Turbopack desactivado en build via `NEXT_USE_TURBOPACK=0`)
- `pnpm lint` – linting
- `pnpm db:generate` – genera Prisma Client
- `pnpm prisma migrate deploy` – aplica migraciones a la base

## Integraciones clave
- **Auth:** Better Auth con Google + email/password. Endpoints en `/api/auth/*`.
- **DB:** Prisma contra Neon. Modelos de cursos, secciones, lecciones, inscripciones y progreso.
- **Video:** Mux (`src/app/actions/mux-actions.ts`, endpoints `/api/mux/*`).
- **Imágenes:** Cloudinary, endpoint de firma en `/api/cloudinary/signature`.

## Rutas y roles
- Marketing: `/`, `/courses`, `/how-it-works`, `/instructors`, `/contact`
- Estudiante: `/dashboard`, `/dashboard/explore`, `/dashboard/my-courses`, `/dashboard/certificates`, `/dashboard/profile`
- Instructor: `/instructor`, `/instructor/courses`, `/instructor/earnings`, `/instructor/analytics`, `/instructor/profile`
- Admin: `/admin` y subrutas (analytics, users, courses, finances, etc.)

## Notas operativas
- Usa la conexión **directa** de Neon para ejecutar migraciones; luego puedes dejar el pooler en producción.
- Si desarrollas desde otro origen (app móvil/webview), ajusta CORS o usa el mismo dominio para cookies de sesión.
- OG dinámico por curso disponible en `/api/og/course/[id]`.
