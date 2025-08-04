import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyProductChange } from '@/lib/productEvents';

// GET - Obtener producto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Parsear las imágenes de JSON string a array
    const productWithImages = {
      ...product,
      images: JSON.parse(product.images || '[]')
    };

    return NextResponse.json(productWithImages);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, price, description, images, status, category } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price && { price: parseFloat(price) }),
        ...(description !== undefined && { description }),
        ...(images && { images: JSON.stringify(images) }),
        ...(status && { status }),
        ...(category !== undefined && { category })
      }
    });

    // Parsear las imágenes para la respuesta
    const productWithImages = {
      ...product,
      images: JSON.parse(product.images || '[]')
    };

    // Notificar cambio a través de SSE
    notifyProductChange('update', id);

    return NextResponse.json(productWithImages);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.product.delete({
      where: { id }
    });

    // Notificar cambio a través de SSE
    notifyProductChange('delete', id);

    return NextResponse.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    );
  }
}