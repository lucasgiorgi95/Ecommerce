import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Página no encontrada</h2>
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/" 
            className="bg-[#b8a089] text-white px-6 py-3 rounded-md font-medium hover:bg-[#a38b73] transition-colors"
          >
            Volver al inicio
          </Link>
          <Link 
            href="/productos" 
            className="bg-[#f0e6db] text-[#b8a089] px-6 py-3 rounded-md font-medium border border-[#e8d7c3] hover:bg-[#e8d7c3] transition-colors"
          >
            Ver productos
          </Link>
        </div>
      </div>
    </div>
  );
}