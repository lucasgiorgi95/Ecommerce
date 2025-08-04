'use client';

import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import CartItem from '@/components/CartItem';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Cargando carrito...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Tu carrito</h1>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-6">Tu carrito está vacío</p>
          <Link 
            href="/productos" 
            className="bg-[#b8a089] text-white px-6 py-2 rounded-md hover:bg-[#a38b73] transition-colors"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {cart.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumen del pedido</h2>
              
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800 font-medium">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Envío</span>
                  <span className="text-gray-800 font-medium">Gratis</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg text-[#b8a089] font-semibold">${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {isAuthenticated ? (
                  <Link 
                    href="/checkout" 
                    className="block w-full bg-[#b8a089] text-white text-center px-6 py-3 rounded-md font-medium hover:bg-[#a38b73] transition-colors"
                  >
                    Finalizar compra
                  </Link>
                ) : (
                  <Link 
                    href="/login?redirect=/checkout" 
                    className="block w-full bg-[#b8a089] text-white text-center px-6 py-3 rounded-md font-medium hover:bg-[#a38b73] transition-colors"
                  >
                    Iniciar sesión para finalizar compra
                  </Link>
                )}
                
                <button 
                  onClick={clearCart}
                  className="block w-full text-red-500 text-center px-6 py-2 rounded-md font-medium hover:bg-red-50 transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}