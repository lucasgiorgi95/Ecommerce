import { Product } from '@/hooks/useCart';
import { getProducts as getProductsFromAPI, getProduct as getProductFromAPI } from '@/services/api';

export async function getProducts(categoria?: string): Promise<Product[]> {
  try {
    const products = await getProductsFromAPI();
    
    if (!products || products.length === 0) {
      return [];
    }
    
    // Convertir al formato esperado por useCart
    const cartProducts = products.map(product => ({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.image,
      description: product.description || '',
      categoria: product.category
    }));

    if (!categoria || categoria === 'todos') {
      return cartProducts;
    }
    
    return cartProducts.filter(product => product.categoria === categoria);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductById(id: number): Promise<Product | undefined> {
  try {
    const product = await getProductFromAPI(id);
    
    if (!product) {
      return undefined;
    }
    
    // Convertir al formato esperado por useCart
    return {
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.image,
      description: product.description || '',
      categoria: product.category
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return undefined;
  }
}

export async function getRelatedProducts(id: number, limit: number = 4): Promise<Product[]> {
  try {
    const allProducts = await getProducts();
    
    if (!allProducts || allProducts.length === 0) {
      return [];
    }
    
    // Excluir el producto actual y obtener productos relacionados (aleatorios)
    const otherProducts = allProducts.filter(product => product.id !== id);
    
    // Mezclar el array para obtener productos aleatorios
    const shuffled = [...otherProducts].sort(() => 0.5 - Math.random());
    
    // Devolver solo la cantidad solicitada
    return shuffled.slice(0, limit);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}