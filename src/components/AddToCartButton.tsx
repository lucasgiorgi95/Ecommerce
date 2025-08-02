'use client';

import { useState } from 'react';
import { useCart, Product } from '@/hooks/useCart';

type AddToCartButtonProps = {
  product: Product;
};

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    
    // Reset button state after animation
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label htmlFor="quantity" className="text-gray-700 font-medium">Cantidad:</label>
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="px-4 py-1 text-gray-800">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isAdded}
        className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${isAdded 
          ? 'bg-green-500 text-white' 
          : 'bg-[#b8a089] text-white hover:bg-[#a38b73]'}`}
      >
        {isAdded ? '¡Agregado al carrito! ✓' : 'Agregar al carrito'}
      </button>
    </div>
  );
}