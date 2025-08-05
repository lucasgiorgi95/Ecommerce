'use client';

import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { Product } from '@/types/product';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="h-full font-sans">
      <Link href={`/productos/${product.id}`} className="block h-full  ">
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
          <div className="relative h-48 bg-gray-100 p-4">
            <SafeImage
              src={product.image}
              alt={product.title}
              width={200}
              height={160}
              className="w-full h-full object-contain"
              fallbackText={product.title}
              priority={false}
            />
          </div>
          <div className="p-4 flex-grow flex flex-col bg-[#f0e6dc]">
            <div className="flex-grow">
              <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 text-base">
                {product.title}
              </h3>
              <span className="inline-block bg-[#f0e6db] text-[#b8a089] text-xs px-2 py-1 rounded-full mb-2 font-medium">
                {product.category}
              </span>
              <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                {product.description}
              </p>
            </div>
            <div className="mt-auto pt-3 border-t border-gray-100">
              <p className="text-lg font-semibold text-[#b8a089]">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}