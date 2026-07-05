import { PrismaClient } from '../generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL no está definida en las variables de entorno')
}

// Crear el adapter de Neon
const adapter = new PrismaNeon({ connectionString })

// SECURITY: los códigos de acceso (hash y texto en claro) se omiten por defecto
// en TODAS las lecturas; solo las rutas del instructor los re-incluyen explícitamente.
const createPrismaClient = () =>
  new PrismaClient({
    adapter,
    omit: {
      course: { joinCode: true, joinCodeHash: true },
      courseSession: { joinCode: true, joinCodeHash: true },
    },
  })

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof createPrismaClient>
}

const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export { prisma }
