import { NextRequest, NextResponse } from 'next/server';
import { VercelBlobService } from '@/lib/vercel-blob';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Obtener todas las URLs de imágenes utilizadas en productos
    const products = await prisma.product.findMany({
      select: { images: true }
    });

    const usedUrls = new Set<string>();
    
    products.forEach(product => {
      try {
        const images = JSON.parse(product.images || '[]');
        images.forEach((url: string) => {
          if (url.includes('blob.vercel-storage.com')) {
            usedUrls.add(url);
          }
        });
      } catch (error) {
        console.error('Error parsing product images:', error);
      }
    });

    // Limpiar imágenes no utilizadas
    const deletedCount = await VercelBlobService.cleanupUnusedImages(Array.from(usedUrls));

    return NextResponse.json({
      success: true,
      message: `${deletedCount} imágenes no utilizadas eliminadas`,
      deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up images:', error);
    return NextResponse.json(
      { error: 'Error al limpiar imágenes' },
      { status: 500 }
    );
  }
}