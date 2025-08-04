import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener producto específico para el frontend público
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);
    
    // Obtener todos los productos publicados ordenados
    const products = await prisma.product.findMany({
      where: {
        status: 'published' // Solo productos publicados
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Encontrar el producto por índice (simulando ID numérico secuencial)
    const product = products[numericId - 1];

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Convertir al formato esperado por el frontend
    const formattedProduct = {
      id: numericId,
      title: product.name,
      price: product.price,
      description: product.description || '',
      category: product.category || '',
      image: JSON.parse(product.images || '[]')[0] || 'https://via.placeholder.com/300x300?text=Sin+Imagen',
      rating: {
        rate: 4.5, // Rating por defecto
        count: Math.floor(Math.random() * 100) + 10 // Count aleatorio
      }
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    );
  }
}