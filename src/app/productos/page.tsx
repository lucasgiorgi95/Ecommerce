'use client'

import ProductGrid from '@/components/ProductGrid';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ProductosPage() {
  const searchParams = useSearchParams();
  const categoriaParam = searchParams.get('categoria');
  const [titulo, setTitulo] = useState('Todos los productos');

  useEffect(() => {
    if (categoriaParam && categoriaParam !== 'todos') {
      // Capitalizar primera letra de la categoría
      const categoriaCapitalizada = categoriaParam.charAt(0).toUpperCase() + categoriaParam.slice(1);
      setTitulo(`${categoriaCapitalizada}`);
    } else {
      setTitulo('Todos los productos');
    }
  }, [categoriaParam]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{titulo}</h1>
      <ProductGrid category={categoriaParam || undefined} />
    </div>
  );
}