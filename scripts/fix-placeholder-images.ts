import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPlaceholderImages() {
  try {
    console.log('🔍 Buscando productos con imágenes de via.placeholder.com...');
    
    // Obtener todos los productos
    const products = await prisma.product.findMany();
    
    let updatedCount = 0;
    
    for (const product of products) {
      let images: string[] = [];
      
      try {
        images = JSON.parse(product.images || '[]');
      } catch (e) {
        console.log(`⚠️  Error parsing images for product ${product.id}`);
        continue;
      }
      
      // Verificar si hay imágenes de via.placeholder.com
      const hasViaPlaceholder = images.some(img => img.includes('via.placeholder.com'));
      
      if (hasViaPlaceholder) {
        console.log(`🔧 Actualizando producto: ${product.name}`);
        
        // Reemplazar URLs de via.placeholder.com con nuestro endpoint local
        const updatedImages = images.map(img => {
          if (img.includes('via.placeholder.com')) {
            // Extraer el texto del placeholder si es posible
            const textMatch = img.match(/text=([^&]+)/);
            const text = textMatch ? decodeURIComponent(textMatch[1]) : 'Sin Imagen';
            
            // Usar nuestro endpoint local
            return `/api/placeholder?width=300&height=300&text=${encodeURIComponent(text)}`;
          }
          return img;
        });
        
        // Actualizar en la base de datos
        await prisma.product.update({
          where: { id: product.id },
          data: {
            images: JSON.stringify(updatedImages)
          }
        });
        
        updatedCount++;
      }
    }
    
    console.log(`✅ Proceso completado. ${updatedCount} productos actualizados.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
fixPlaceholderImages();