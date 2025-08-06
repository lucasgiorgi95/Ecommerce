import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Obtener todos los productos
    const products = await prisma.product.findMany();
    
    let fixedCount = 0;
    
    for (const product of products) {
      let images: string[] = [];
      let needsUpdate = false;
      
      try {
        images = JSON.parse(product.images || '[]');
      } catch (e) {
        console.log(`Error parsing images for product ${product.id}`);
        continue;
      }
      
      // Filtrar imágenes rotas (rutas locales que ya no existen)
      const fixedImages = images.map(img => {
        if (img.startsWith('/uploads/products/') || img.includes('localhost')) {
          needsUpdate = true;
          // Reemplazar con placeholder
          return `/api/placeholder?width=300&height=300&text=${encodeURIComponent(product.name)}`;
        }
        return img;
      });
      
      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            images: JSON.stringify(fixedImages)
          }
        });
        fixedCount++;
        console.log(`Fixed images for product: ${product.name}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `${fixedCount} productos actualizados con imágenes corregidas`,
      fixedCount
    });
  } catch (error) {
    console.error('Error fixing broken images:', error);
    return NextResponse.json(
      { error: 'Error al corregir imágenes rotas' },
      { status: 500 }
    );
  }
}