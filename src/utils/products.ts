import { Product } from '@/hooks/useCart';
import productsData from '@/data/products.json';

export function getProducts(categoria?: string): Product[] {
  if (!categoria || categoria === 'todos') {
    return productsData;
  }
  
  return productsData.filter(product => product.categoria === categoria);
}

export function getProductById(id: number): Product | undefined {
  return productsData.find(product => product.id === id);
}

export function getRelatedProducts(id: number, limit: number = 4): Product[] {
  // Excluir el producto actual y obtener productos relacionados (en este caso, aleatorios)
  const otherProducts = productsData.filter(product => product.id !== id);
  
  // Mezclar el array para obtener productos aleatorios
  const shuffled = [...otherProducts].sort(() => 0.5 - Math.random());
  
  // Devolver solo la cantidad solicitada
  return shuffled.slice(0, limit);
}