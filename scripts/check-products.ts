import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  console.log('🔍 Verificando productos en la base de datos...');

  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        images: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(`📊 Total de productos encontrados: ${products.length}`);

    if (products.length === 0) {
      console.log('❌ No hay productos en la base de datos');
      return;
    }

    console.log('\n📋 Últimos 10 productos:');
    products.forEach((product, index) => {
      const images = JSON.parse(product.images || '[]');
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Imágenes: ${images.length > 0 ? images[0] : 'Sin imagen'}`);
      console.log(`   Creado: ${product.createdAt.toLocaleDateString()}`);
    });

  } catch (error) {
    console.error('❌ Error verificando productos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts().catch(console.error);