import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixImageUrls() {
  console.log('🔍 Buscando productos con URLs de imagen problemáticas...');

  try {
    // Buscar productos con URLs problemáticas
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { images: { contains: 'placehold.co' } },
          { images: { contains: 'via.placeholder' } },
          { images: { contains: 'placeholder.com' } },
        ]
      }
    });

    console.log(`📊 Encontrados ${products.length} productos con URLs problemáticas`);

    if (products.length === 0) {
      console.log('✅ No se encontraron productos con URLs problemáticas');
      return;
    }

    // Actualizar cada producto
    let updatedCount = 0;
    for (const product of products) {
      try {
        const images = JSON.parse(product.images || '[]');
        const cleanImages = images.filter((url: string) => 
          !url.includes('placehold.co') && 
          !url.includes('via.placeholder') && 
          !url.includes('placeholder.com')
        );

        // Si no quedan imágenes válidas, usar array vacío
        const newImages = JSON.stringify(cleanImages);

        await prisma.product.update({
          where: { id: product.id },
          data: { images: newImages }
        });

        updatedCount++;
        console.log(`✅ Actualizado producto: ${product.title}`);
      } catch (error) {
        console.error(`❌ Error actualizando producto ${product.id}:`, error);
      }
    }

    console.log(`🎉 Proceso completado. ${updatedCount} productos actualizados.`);
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
fixImageUrls().catch(console.error);