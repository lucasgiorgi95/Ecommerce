"use client";
import Link from "next/link";
import CartButton from "@/components/CartButton";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar menú móvil cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setMobileMenuOpen(false);
    };

    // Solo agregar listener cuando el menú móvil está abierto
    if (mobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el clic se propague
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Renderizar contenido de autenticación solo cuando esté montado
  const renderAuthContent = () => {
    if (!mounted || isLoading) {
      return <div className="w-20 h-6 bg-gray-200 animate-pulse rounded"></div>;
    }

    if (isAuthenticated) {
      return (
        <button
          onClick={logout}
          className="text-gray-700 hover:text-[#b8a089] transition-colors p-2 rounded-md hover:bg-[#f0e6db] flex items-center gap-2"
          title="Cerrar sesión"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Cerrar sesión</span>
        </button>
      );
    }

    return (
      <Link
        href="/login"
        className="text-gray-700 hover:text-[#b8a089] transition-colors"
      >
        Iniciar sesión
      </Link>
    );
  };

  // Renderizar contenido de autenticación móvil
  const renderMobileAuthContent = () => {
    if (!mounted || isLoading) {
      return (
        <div className="py-2 border-b border-gray-100">
          <div className="w-32 h-6 bg-gray-200 animate-pulse rounded mx-auto"></div>
        </div>
      );
    }

    if (isAuthenticated) {
      return (
        <div className="py-2 border-b border-gray-100 flex justify-center">
          <button
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
            }}
            className="text-gray-700 hover:text-[#b8a089] transition-colors p-2 rounded-md hover:bg-[#f0e6db] flex items-center gap-2"
            title="Cerrar sesión"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="text-sm">Cerrar sesión</span>
          </button>
        </div>
      );
    }

    return (
      <Link
        href="/login"
        className="text-gray-700 hover:text-[#b8a089] transition-colors py-2 border-b border-gray-100"
        onClick={() => setMobileMenuOpen(false)}
      >
        Iniciar sesión
      </Link>
    );
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
              d={
                mobileMenuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>

        {/* Menú de navegación (escritorio) */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-gray-700 hover:text-[#b8a089] transition-colors"
          >
            Inicio
          </Link>

          <Link
            href="/productos"
            className="text-gray-700 hover:text-[#b8a089] transition-colors"
          >
            Productos
          </Link>

          <Link
            href="/contacto"
            className="text-gray-700 hover:text-[#b8a089] transition-colors"
          >
            Contacto
          </Link>

          {renderAuthContent()}

          <CartButton />
        </div>

        {/* Menú móvil desplegable */}
        <div
          className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="container text-center mx-auto px-4 py-6 flex flex-col h-full ">
            <div className="flex justify-between items-center mb-8">
              <Link
                href="/"
                className="flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl font-semibold text-[#b8a089]">
                  Tienda
                </span>
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

              {renderMobileAuthContent()}
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
