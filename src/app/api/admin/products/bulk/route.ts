import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyProductChange } from '@/lib/productEvents';

// POST - Importación masiva de productos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de productos' },
        { status: 400 }
      );
    }

    // Validar cada producto
    for (const product of products) {
      if (!product.name || !product.price) {
        return NextResponse.json(
          { error: 'Cada producto debe tener nombre y precio' },
          { status: 400 }
        );
      }
    }

    // Crear productos en lote
    const createdProducts = await prisma.$transaction(
      products.map(product => 
        prisma.product.create({
          data: {
            name: product.name,
            price: parseFloat(product.price),
            description: product.description || null,
            images: JSON.stringify(product.images || []),
            status: product.status || 'published',
            category: product.category || null
          }
        })
      )
    );

    // Parsear las imágenes para la respuesta
    const productsWithImages = createdProducts.map(product => ({
      ...product,
      images: JSON.parse(product.images || '[]')
    }));

    // Notificar cambios masivos a través de SSE
    createdProducts.forEach(product => {
      notifyProductChange('create', product.id);
    });

    return NextResponse.json({
      message: `${createdProducts.length} productos creados exitosamente`,
      products: productsWithImages
    }, { status: 201 });
  } catch (error) {
    console.error('Error bulk creating products:', error);
    return NextResponse.json(
      { error: 'Error en la importación masiva' },
      { status: 500 }
    );
  }
}