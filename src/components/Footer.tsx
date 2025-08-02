import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#f0e6db] py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-[#b8a089] mb-4">Tienda</h3>
            <p className="text-gray-600 text-sm">
              Tienda online con los mejores productos para ti.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-4">Enlaces</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/productos" className="text-gray-600 hover:text-[#b8a089] transition-colors">
                  Todos los productos
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-[#b8a089] transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-600 hover:text-[#b8a089] transition-colors">
                  Carrito
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Email: info@tienda.com</li>
              <li>Teléfono: +123 456 7890</li>
              <li>Dirección: Calle Ejemplo 123, Ciudad</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Tienda. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}