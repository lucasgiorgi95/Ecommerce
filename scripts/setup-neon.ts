// Script para configurar Neon Database
import { PrismaClient } from '@prisma/client';

async function setupNeon() {
  console.log('🐘 Configurando Neon PostgreSQL...\n');

  try {
    const prisma = new PrismaClient();
    
    // Probar conexión
    console.log('1. Probando conexión a Neon...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa a Neon');

    // Verificar tablas
    console.log('\n2. Verificando estructura de base de datos...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📋 Tablas encontradas:', tables);

    // Contar productos
    console.log('\n3. Verificando productos...');
    const productCount = await prisma.product.count();
    console.log(`📦 Productos en base de datos: ${productCount}`);

    if (productCount === 0) {
      console.log('\n4. Base de datos vacía, ejecuta: npm run db:seed');
    } else {
      console.log('\n4. ✅ Base de datos configurada correctamente');
    }

    await prisma.$disconnect();
    console.log('\n🎉 Configuración de Neon completada');

  } catch (error) {
    console.error('❌ Error conectando a Neon:', error);
    console.log('\n🔧 Verifica que:');
    console.log('1. Tu connection string en .env sea correcta');
    console.log('2. Empiece con postgresql://');
    console.log('3. Incluya ?sslmode=require al final');
    console.log('\nEjemplo:');
    console.log('DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"');
  }
}

setupNeon();