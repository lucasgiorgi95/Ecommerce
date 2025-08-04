// Script para limpiar imágenes que ya no se usan
import { PrismaClient } from '@prisma/client';
import { readdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function cleanupUnusedImages() {
  console.log('🧹 Limpiando imágenes no utilizadas...\n');

  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    
    if (!existsSync(uploadsDir)) {
      console.log('📁 Directorio de uploads no existe');
      return;
    }

    // Obtener todas las imágenes del directorio
    const files = await readdir(uploadsDir);
    const imageFiles = files.filter(file => 
      file.match(/\.(jpg|jpeg|png|gif|webp)$/i) && file !== '.gitkeep'
    );

    console.log(`📸 Imágenes encontradas: ${imageFiles.length}`);

    // Obtener todas las imágenes usadas en la BD
    const products = await prisma.product.findMany({
      select: { images: true }
    });

    const usedImages = new Set<string>();
    products.forEach(product => {
      try {
        const images = JSON.parse(product.images || '[]');
        images.forEach((imageUrl: string) => {
          // Extraer nombre del archivo de la URL
          const filename = imageUrl.split('/').pop();
          if (filename) {
            usedImages.add(filename);
          }
        });
      } catch (error) {
        console.error('Error parsing images:', error);
      }
    });

    console.log(`🔗 Imágenes en uso: ${usedImages.size}`);

    // Encontrar imágenes huérfanas
    const orphanedImages = imageFiles.filter(file => !usedImages.has(file));
    
    console.log(`🗑️  Imágenes huérfanas: ${orphanedImages.length}`);

    if (orphanedImages.length === 0) {
      console.log('✅ No hay imágenes para limpiar');
      return;
    }

    // Eliminar imágenes huérfanas
    let deletedCount = 0;
    for (const filename of orphanedImages) {
      try {
        const filepath = path.join(uploadsDir, filename);
        await unlink(filepath);
        console.log(`🗑️  Eliminado: ${filename}`);
        deletedCount++;
      } catch (error) {
        console.error(`❌ Error eliminando ${filename}:`, error);
      }
    }

    console.log(`\n✅ Limpieza completada: ${deletedCount} imágenes eliminadas`);
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupUnusedImages();