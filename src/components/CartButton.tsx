'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../hooks/useCart';

export default function CartButton() {
  const { cart } = useCart();
  const [itemCount, setItemCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Calculate total items in cart
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setItemCount(count);
  }, [cart]);

  return (
    <Link href="/cart" className="relative">
      <button 
        className="flex items-center justify-center p-2 rounded-full bg-[#f0e6db] hover:bg-[#e8d7c3] transition-colors"
        aria-label="Ver carrito"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-[#b8a089]" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
          />
        </svg>
        {isClient && itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#b8a089] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>
    </Link>
  );
}