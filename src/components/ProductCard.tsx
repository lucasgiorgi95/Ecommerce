'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="h-full font-sans">
      <Link href={`/productos/${product.id}`} className="block h-full  ">
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
          <div className="relative h-48 bg-gray-100">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-contain p-4"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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