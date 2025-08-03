import { Product } from '@/types/product';
import { prisma } from '@/lib/prisma';

// Función para usar en el servidor (SSR)
export async function getProductsServer(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'published'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return products.map((product, index) => ({
      id: index + 1,
      title: product.name,
      price: product.price,
      description: product.description || '',
      category: product.category || '',
      image: JSON.parse(product.images || '[]')[0] || 'https://via.placeholder.com/300x300?text=Sin+Imagen',
      rating: {
        rate: 4.5,
        count: Math.floor(Math.random() * 100) + 10
      }
    }));
  } catch (error) {
    console.error('Error fetching products from database:', error);
    return [];
  }
}

// Función para usar en el cliente
export async function getProducts(): Promise<Product[]> {
  if (typeof window === 'undefined') {
    // En el servidor, usar Prisma directamente
    return getProductsServer();
  }

  // En el cliente, usar fetch
  try {
    const response = await fetch('/api/products', {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`API response not ok: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching products from API:', error);
    // Fallback: intentar obtener desde el servidor
    try {
      return await getProductsServer();
    } catch (serverError) {
      console.error('Error fetching from server fallback:', serverError);
      return [];
    }
  }
}

export async function getProduct(id: number): Promise<Product> {
  if (typeof window === 'undefined') {
    // En el servidor, usar Prisma directamente
    const products = await getProductsServer();
    const product = products[id - 1];
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  // En el cliente, usar fetch
  const response = await fetch(`/api/products/${id}`, {
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error('Error fetching product');
  }
  return response.json();
}

export async function getCategories(): Promise<string[]> {
  try {
    const products = await getProducts();
    const categories = [...new Set(products.map(product => product.category))];
    return categories.filter(Boolean);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
