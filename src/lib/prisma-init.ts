import { PrismaClient } from '@prisma/client';

// Función para inicializar Prisma con manejo de errores
let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.__prisma;
}

// Función para verificar la conexión
export async function initializePrisma() {
  try {
    await prisma.$connect();
    console.log('✅ Prisma conectado exitosamente');
    return prisma;
  } catch (error) {
    console.error('❌ Error conectando Prisma:', error);
    throw error;
  }
}

export { prisma };