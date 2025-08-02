'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  
  useEffect(() => {
    // Generate a random order number
    const randomOrderNumber = Math.floor(100000 + Math.random() * 900000).toString();
    setOrderNumber(randomOrderNumber);
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center bg-white rounded-lg shadow-sm p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">¡Pedido completado!</h1>
        
        <p className="text-gray-600 mb-2">
          Gracias por tu compra. Hemos recibido tu pedido y está siendo procesado.
        </p>
        
        <p className="text-gray-600 mb-6">
          Tu número de pedido es: <span className="font-semibold text-[#b8a089]">{orderNumber}</span>
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link 
            href="/productos" 
            className="bg-[#b8a089] text-white px-6 py-3 rounded-md font-medium hover:bg-[#a38b73] transition-colors"
          >
            Seguir comprando
          </Link>
          
          <Link 
            href="/" 
            className="bg-gray-100 text-gray-800 px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}