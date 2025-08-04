'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/product';
import { getProducts } from '@/services/api';
import { cacheManager } from '@/lib/cache';
import { useProductEvents } from './useProductEvents';

const PRODUCTS_CACHE_KEY = 'products';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos (aumentado porque ahora tenemos SSE)

export function useRealtimeProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      
      // Intentar obtener del cache primero
      if (!forceRefresh) {
        const cachedProducts = cacheManager.get<Product[]>(PRODUCTS_CACHE_KEY);
        if (cachedProducts) {
          const filteredProducts = category && category !== 'todos'
            ? cachedProducts.filter(product => product.category === category)
            : cachedProducts;
          setProducts(filteredProducts);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      const data = await getProducts();
      
      // Guardar en cache
      cacheManager.set(PRODUCTS_CACHE_KEY, data, CACHE_TTL);
      
      // Filtrar por categoría
      const filteredProducts = category && category !== 'todos'
        ? data.filter(product => product.category === category)
        : data;
      
      setProducts(filteredProducts);
    } catch (err) {
      setError('Error al cargar productos');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  // Función para invalidar cache y refrescar
  const refreshProducts = useCallback(() => {
    cacheManager.invalidate(PRODUCTS_CACHE_KEY);
    fetchProducts(true);
  }, [fetchProducts]);

  // Configurar SSE para actualizaciones en tiempo real
  const { reconnect } = useProductEvents(() => {
    // Cuando se detecta un cambio, invalidar cache y refrescar
    cacheManager.invalidate(PRODUCTS_CACHE_KEY);
    fetchProducts(true);
  });

  useEffect(() => {
    fetchProducts();

    // Suscribirse a cambios en el cache
    const unsubscribe = cacheManager.subscribe(PRODUCTS_CACHE_KEY, () => {
      fetchProducts();
    });

    // Polling de respaldo cada 2 minutos (reducido porque tenemos SSE)
    const pollInterval = setInterval(() => {
      fetchProducts(true);
    }, 120000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refreshProducts,
    reconnectEvents: reconnect
  };
}