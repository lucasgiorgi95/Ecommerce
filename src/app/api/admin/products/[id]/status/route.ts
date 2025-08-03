import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Actualizar solo el estado del producto
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validar que el estado sea válido
    if (!status || !['published', 'paused'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido. Debe ser "published" o "paused"' },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: { status }
    });

    // Parsear las imágenes para la respuesta
    const productWithImages = {
      ...product,
      images: JSON.parse(product.images || '[]')
    };

    return NextResponse.json(productWithImages);
  } catch (error) {
    console.error('Error updating product status:', error);
    return NextResponse.json(
      { error: 'Error al actualizar estado del producto' },
      { status: 500 }
    );
  }
}