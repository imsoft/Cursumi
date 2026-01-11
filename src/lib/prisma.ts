import { PrismaClient } from '../generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL no está definida en las variables de entorno')
}

// Crear el adapter de Neon
const adapter = new PrismaNeon({ connectionString })

// Crear instancia de Prisma Client con el adapter
const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export { prisma }

