import { getProduct, getProducts } from '@/services/api';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductPageClient from './ProductPageClient';

// Generar metadata dinámico
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const product = await getProduct(parseInt(id));
    
    return {
      title: `${product.title} - Tienda Online`,
      description: product.description || `Compra ${product.title} al mejor precio`,
      keywords: [product.title, product.category, 'tienda online', 'comprar'].join(', '),
      openGraph: {
        title: product.title,
        description: product.description || `Compra ${product.title} al mejor precio`,
        images: [
          {
            url: product.image,
            width: 800,
            height: 800,
            alt: product.title,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.title,
        description: product.description || `Compra ${product.title} al mejor precio`,
        images: [product.image],
      },
    };
  } catch (error) {
    return {
      title: 'Producto no encontrado - Tienda Online',
      description: 'El producto que buscas no está disponible',
    };
  }
}

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const productId = parseInt(id);

  try {
    const product = await getProduct(productId);
    const allProducts = await getProducts();
    const relatedProducts = allProducts
      .filter(p => p.id !== productId && p.category === product.category)
      .slice(0, 4);

    return (
      <ProductPageClient 
        product={product} 
        relatedProducts={relatedProducts}
        productId={productId}
      />
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }
}