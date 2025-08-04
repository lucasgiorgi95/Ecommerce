'use client'

import ProductGrid from '@/components/ProductGrid';
import CategoryFilter from '@/components/CategoryFilter';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { formatCategoryName } from '@/lib/categories';

function ProductosContent() {
  const searchParams = useSearchParams();
  const categoriaParam = searchParams.get('categoria');
  const [titulo, setTitulo] = useState('Todos los productos');

  useEffect(() => {
    if (categoriaParam && categoriaParam !== 'todos') {
      setTitulo(formatCategoryName(categoriaParam));
    } else {
      setTitulo('Todos los productos');
    }
  }, [categoriaParam]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{titulo}</h1>
        <p className="text-gray-600">Descubre nuestra selección de productos de calidad</p>
      </div>
      
      <CategoryFilter />
      <ProductGrid category={categoriaParam || undefined} />
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando productos...</div>
      </div>
    }>
      <ProductosContent />
    </Suspense>
  );
}