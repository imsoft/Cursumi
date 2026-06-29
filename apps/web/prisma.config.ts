import 'dotenv/config'
import { defineConfig } from 'prisma/config'

/**
 * URL para los comandos del CLI de Prisma (migrate / status / generate).
 *
 * IMPORTANTE: este config SOLO lo usa el CLI. El runtime de la app NO lo lee:
 * usa el adapter de Neon con `DATABASE_URL` directamente en `src/lib/prisma.ts`.
 * Por eso aquí usamos una conexión DIRECTA (no-pooled), que es lo que necesita
 * `prisma migrate`: el pooler de Neon (`-pooler`, PgBouncer en modo transacción)
 * no soporta los advisory locks de sesión que usa migrate → P1002
 * "Timed out trying to acquire a postgres advisory lock".
 *
 * La URL directa de Neon es la misma sin el infijo `-pooler`. Preferimos
 * DIRECT_URL / DATABASE_URL_UNPOOLED explícitos si existen (Vercel + integración
 * Neon los expone); si no, la derivamos quitando `-pooler`.
 */
function migrationUrl(): string | undefined {
  const explicit = process.env.DIRECT_URL || process.env.DATABASE_URL_UNPOOLED
  if (explicit) return explicit
  const pooled = process.env.DATABASE_URL
  return pooled ? pooled.replace('-pooler.', '.') : pooled
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: migrationUrl(),
  },
})
