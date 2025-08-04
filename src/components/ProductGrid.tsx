"use client";

import ProductCard from "./ProductCard";
import { useRealtimeProducts } from "@/hooks/useRealtimeProducts";

type ProductGridProps = {
  category?: string;
};

export default function ProductGrid({ category }: ProductGridProps) {
  const { products, loading, error, refreshProducts, reconnectEvents } =
    useRealtimeProducts(category);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b8a089]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => {
            refreshProducts();
            reconnectEvents();
          }}
          className="mt-4 px-4 py-2 bg-[#b8a089] text-white rounded-md hover:bg-[#a08a7a] transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No se encontraron productos.</p>
        <p className="text-sm text-gray-500 mt-2">
          Los productos se actualizan automáticamente cuando se agregan desde el
          admin.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
