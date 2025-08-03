import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener productos publicados para el frontend público
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'published' // Solo productos publicados
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Convertir al formato esperado por el frontend con IDs secuenciales
    const formattedProducts = products.map((product, index) => ({
      id: index + 1, // ID secuencial empezando en 1
      title: product.name,
      price: product.price,
      description: product.description || '',
      category: product.category || '',
      image: JSON.parse(product.images || '[]')[0] || 'https://via.placeholder.com/300x300?text=Sin+Imagen',
      rating: {
        rate: 4.5, // Rating por defecto
        count: Math.floor(Math.random() * 100) + 10 // Count aleatorio
      }
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching public products:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}