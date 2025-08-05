import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyProductChange } from '@/lib/productEvents';

// GET - Obtener todos los productos
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parsear las imágenes de JSON string a array
    const productsWithImages = products.map(product => ({
      ...product,
      images: JSON.parse(product.images || '[]')
    }));

    return NextResponse.json(productsWithImages);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, description, images, status, category, stock } = body;

    // Validaciones básicas
    if (!name || !price) {
      return NextResponse.json(
        { error: 'Nombre y precio son requeridos' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        description: description || null,
        images: JSON.stringify(images || []),
        status: status || 'published',
        category: category || null,
        stock: stock ? parseInt(stock) : 0
      }
    });

    // Parsear las imágenes para la respuesta
    const productWithImages = {
      ...product,
      images: JSON.parse(product.images || '[]')
    };

    // Notificar cambio a través de SSE
    notifyProductChange('create', product.id);

    return NextResponse.json(productWithImages, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    );
  }
}