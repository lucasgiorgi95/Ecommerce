import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Función para asegurar la conexión
export async function ensurePrismaConnection() {
  try {
    await prisma.$connect()
    return prisma
  } catch (error) {
    console.error('Error connecting to database:', error)
    throw error
  }
}