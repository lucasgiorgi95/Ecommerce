import ProductGrid from '@/components/ProductGrid';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div 
          className="rounded-lg p-12 mb-8 relative overflow-hidden" 
          style={{
            backgroundImage: "url('/images/hero-bg.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "400px"
          }}
        >
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-[#8a7158] mb-4">Bienvenido a Tienda</h1>
            <p className="text-gray-700 mb-6 text-lg max-w-xl">Descubre nuestra colección de productos de alta calidad para todos los estilos.</p>
            <Link 
              href="/productos" 
              className="bg-[#b8a089] text-white px-8 py-3 rounded-md hover:bg-[#a38b73] transition-colors text-lg font-medium"
            >
              Ver todos los productos
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Productos destacados</h2>
          <Link 
            href="/productos" 
            className="text-[#b8a089] hover:text-[#8a7158] transition-colors"
          >
            Ver todos →
          </Link>
        </div>
        
        <ProductGrid />
      </section>
    </div>
  );
}
