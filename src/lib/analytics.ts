/* eslint-disable @typescript-eslint/no-explicit-any */
// Sistema de analytics para tracking de productos
import { prisma } from './prisma';

export interface ProductView {
  productId: string;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

export interface ProductStats {
  productId: string;
  productName: string;
  views: number;
  lastViewed: Date;
}

// Crear tabla de analytics si no existe
export async function initAnalytics() {
  try {
    // Esta función se ejecutará cuando se implemente la migración
    console.log('Analytics initialized');
  } catch (error) {
    console.error('Error initializing analytics:', error);
  }
}

// Registrar vista de producto
export async function trackProductView(
  productId: string,
  userAgent?: string,
  ip?: string
): Promise<void> {
  try {
    // Por ahora usar localStorage en el cliente para tracking básico
    if (typeof window !== 'undefined') {
      const views = JSON.parse(localStorage.getItem('product_views') || '{}');
      const today = new Date().toDateString();
      
      if (!views[today]) {
        views[today] = {};
      }
      
      views[today][productId] = (views[today][productId] || 0) + 1;
      localStorage.setItem('product_views', JSON.stringify(views));
    }
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
}

// Obtener productos más vistos
export async function getMostViewedProducts(limit: number = 10): Promise<ProductStats[]> {
  try {
    if (typeof window !== 'undefined') {
      const views = JSON.parse(localStorage.getItem('product_views') || '{}');
      const productCounts: Record<string, number> = {};
      
      // Sumar vistas de todos los días
      Object.values(views).forEach((dayViews: any) => {
        Object.entries(dayViews).forEach(([productId, count]) => {
          productCounts[productId] = (productCounts[productId] || 0) + (count as number);
        });
      });
      
      // Convertir a array y ordenar
      const sortedProducts = Object.entries(productCounts)
        .map(([productId, views]) => ({
          productId,
          productName: `Producto ${productId}`,
          views,
          lastViewed: new Date()
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
      
      return sortedProducts;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting most viewed products:', error);
    return [];
  }
}

// Hook para usar analytics
export function useProductAnalytics() {
  const trackView = (productId: string) => {
    trackProductView(productId, navigator.userAgent);
  };

  const getMostViewed = async (limit?: number) => {
    return getMostViewedProducts(limit);
  };

  return {
    trackView,
    getMostViewed
  };
}