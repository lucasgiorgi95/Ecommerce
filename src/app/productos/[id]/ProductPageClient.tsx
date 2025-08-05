'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import AddToCartButton from '../../../components/AddToCartButton';
import { Product } from '@/types/product';

type ProductPageClientProps = {
  product: Product;
  relatedProducts: Product[];
  productId: number;
};

export default function ProductPageClient({ product, relatedProducts, productId }: ProductPageClientProps) {
  useEffect(() => {
    // Trackear vista del producto
    const trackView = async () => {
      try {
        const { trackProductView } = await import('@/lib/analytics');
        trackProductView(productId.toString());
      } catch (error) {
        console.error('Error tracking product view:', error);
      }
    };

    trackView();
  }, [productId]);

  // Convertir el producto de la API al formato esperado por AddToCartButton
  const cartProduct = {
    id: product.id,
    name: product.title,
    price: product.price,
    image: product.image,
    description: product.description,
    categoria: product.category
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/productos" 
          className="text-[#b8a089] hover:text-[#8a7158] transition-colors flex items-center gap-1"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a productos
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-[#f9f7f5] rounded-lg overflow-hidden max-w-md mx-auto md:mx-0 p-6">
          <SafeImage 
            src={product.image} 
            alt={product.title}
            width={400}
            height={400}
            className="w-full h-auto object-contain"
            fallbackText={product.title}
            priority
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.title}</h1>
          <p className="text-2xl font-bold text-[#b8a089] mb-6">${product.price.toFixed(2)}</p>
          
          <div className="mb-6">
            <span className="inline-block bg-[#f0e6db] text-[#b8a089] text-sm px-3 py-1 rounded-full mb-4 font-medium">
              {product.category}
            </span>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Descripción</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>
          
          <AddToCartButton product={cartProduct} />
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Productos relacionados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="h-full font-sans">
                <Link href={`/productos/${relatedProduct.id}`} className="block h-full">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                    <div className="h-48 bg-gray-100 p-4">
                      <SafeImage
                        src={relatedProduct.image}
                        alt={relatedProduct.title}
                        width={200}
                        height={160}
                        className="w-full h-full object-contain"
                        fallbackText={relatedProduct.title}
                      />
                    </div>
                    <div className="p-4 flex-grow flex flex-col bg-[#f0e6dc]">
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 text-base">
                          {relatedProduct.title}
                        </h3>
                        <span className="inline-block bg-[#f0e6db] text-[#b8a089] text-xs px-2 py-1 rounded-full mb-2 font-medium">
                          {relatedProduct.category}
                        </span>
                      </div>
                      <div className="mt-auto pt-3 border-t border-gray-100">
                        <p className="text-lg font-semibold text-[#b8a089]">
                          ${relatedProduct.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}