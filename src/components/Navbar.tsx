'use client'
import Link from 'next/link';
import Image from 'next/image';
import CartButton from '@/components/CartButton';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [showCategories, setShowCategories] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cerrar menús cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setShowCategories(false);
      setMobileMenuOpen(false);
    };

    // Solo agregar listener cuando algún menú está abierto
    if (showCategories || mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showCategories, mobileMenuOpen]);

  const toggleCategories = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el clic se propague
    setShowCategories(!showCategories);
  };

  const toggleMobileMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el clic se propague
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-semibold text-[#b8a089]">Tienda</span>
        </Link>

        {/* Botón de menú hamburguesa (solo visible en móvil) */}
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden flex items-center p-2 rounded-md hover:bg-[#f0e6db] transition-colors"
          aria-label="Abrir menú"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-gray-700" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
            />
          </svg>
        </button>

        {/* Menú de navegación (escritorio) */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="relative">
            <button 
              onClick={toggleCategories}
              className="text-gray-700 hover:text-[#b8a089] transition-colors flex items-center"
            >
              Categorías
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 ml-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCategories && (
              <div 
                className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <Link href="/productos" className="block px-4 py-2 text-gray-700 hover:bg-[#f0e6db] hover:text-[#b8a089]">
                  Todos
                </Link>
                <Link href="/productos?categoria=ropa" className="block px-4 py-2 text-gray-700 hover:bg-[#f0e6db] hover:text-[#b8a089]">
                  Ropa
                </Link>
                <Link href="/productos?categoria=accesorios" className="block px-4 py-2 text-gray-700 hover:bg-[#f0e6db] hover:text-[#b8a089]">
                  Accesorios
                </Link>
                <Link href="/productos?categoria=calzado" className="block px-4 py-2 text-gray-700 hover:bg-[#f0e6db] hover:text-[#b8a089]">
                  Calzado
                </Link>
              </div>
            )}
          </div>
          
          <Link href="/" className="text-gray-700 hover:text-[#b8a089] transition-colors">
            Inicio
          </Link>
          
          <Link href="/productos" className="text-gray-700 hover:text-[#b8a089] transition-colors">
            Productos
          </Link>
          
          <Link href="/contacto" className="text-gray-700 hover:text-[#b8a089] transition-colors">
            Contacto
          </Link>
          
          <Link href="/login" className="text-gray-700 hover:text-[#b8a089] transition-colors">
            Iniciar sesión
          </Link>
          
          <CartButton />
        </div>

        {/* Menú móvil desplegable */}
        <div 
          className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="container text-center mx-auto px-4 py-6 flex flex-col h-full ">
            <div className="flex justify-between items-center mb-8">
              <Link href="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-xl font-semibold text-[#b8a089]">Tienda</span>
              </Link>
              <button 
                onClick={toggleMobileMenu}
                className="p-2 rounded-md hover:bg-[#f0e6db] transition-colors"
                aria-label="Cerrar menú"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-gray-700" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 flex flex-col space-y-6 text-lg">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-[#b8a089] transition-colors py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              
              <div className={`py-2 border-b border-gray-100 transition-all duration-300 ease-in-out ${showCategories ? 'bg-[#f0e6db] rounded-md' : ''}`}>
                <div className="flex flex-col items-center">
                  <button 
                    onClick={toggleCategories}
                    className="w-full text-center text-gray-700 hover:text-[#b8a089] transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Categorías</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showCategories ? 'max-h-40' : 'max-h-0'}`}>
                  <div className="mt-2 gap-4 ml-4 flex flex-col space-y-2">
                    <Link 
                      href="/productos" 
                      className="text-gray-700 hover:text-[#b8a089] transition-colors border-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Todos
                    </Link>
                    <Link 
                      href="/productos?categoria=ropa" 
                      className="text-gray-700 hover:text-[#b8a089] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Ropa
                    </Link>
                    <Link 
                      href="/productos?categoria=accesorios" 
                      className="text-gray-700 hover:text-[#b8a089] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Accesorios
                    </Link>
                    <Link 
                      href="/productos?categoria=calzado" 
                      className="text-gray-700 hover:text-[#b8a089] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Calzado
                    </Link>
                  </div>
                </div>
              </div>
              
              <Link 
                href="/productos" 
                className="text-gray-700 hover:text-[#b8a089] transition-colors py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Productos
              </Link>
              
              <Link 
                href="/contacto" 
                className="text-gray-700 hover:text-[#b8a089] transition-colors py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contacto
              </Link>
              
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-[#b8a089] transition-colors py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Iniciar sesión
              </Link>
            </div>
            
            <div className="mt-auto py-4 flex justify-center">
              <CartButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}