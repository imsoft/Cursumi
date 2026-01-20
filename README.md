# Cursumi Frontend

Frontend en Next.js 16 (App Router) con autenticación Better Auth + Prisma/Neon y UI basada en shadcn/tailwind v4.

## Requisitos
- Node 20+
- pnpm
- Variables de entorno (`.env.local`): usa `.env.example` como referencia.

## Scripts
- `pnpm dev` – desarrollo
- `pnpm lint` – lint (pasa en limpio)
- `pnpm build` / `pnpm start` – producción
- `pnpm db:generate` – generar cliente Prisma (usa `prisma/schema.prisma`)
- `pnpm db:migrate` o `pnpm db:push` – aplicar schema a Neon

## Configuración rápida
1) Copia `.env.example` a `.env.local` y rellena:
   - `DATABASE_URL` (Neon PostgreSQL)
   - `NEXT_PUBLIC_APP_URL` (ej: http://localhost:3000)
   - Resend (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`)
   - Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
   - Mux (`MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`) para uploads de video
2) Instala deps: `pnpm install`
3) Genera Prisma: `pnpm db:generate` y migra/push la BD.
4) Ejecuta: `pnpm dev`

## Documentación útil
- `docs/AUTH_SETUP.md` – flujo de auth, Resend, Google.
- `docs/PROJECT_STRUCTURE.md` – organización de rutas y componentes.

## Notas
- Rutas protegidas: layouts de Admin/Instructor/Student validan sesión con Better Auth en server y el proxy (`src/proxy.ts`) revisa cookie de sesión.
- Datos de dashboards y algunas vistas siguen mock; conecta todo a Prisma/Neon antes de producción.
- Mux: `src/app/actions/mux-actions.ts` expone `createMuxUploadUrl` (requiere env). Úsalo desde el frontend para obtener URL de carga directa.
