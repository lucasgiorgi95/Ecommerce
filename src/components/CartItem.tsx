'use client';

import SafeImage from '@/components/SafeImage';
import { useCart, CartItem as CartItemType } from '@/hooks/useCart';

type CartItemProps = {
  item: CartItemType;
};

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(product.id, newQuantity);
  };

  const handleRemove = () => {
    removeFromCart(product.id);
  };

  return (
    <div className="flex items-center py-4 border-b border-gray-200 last:border-b-0">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
        <SafeImage
          src={product.image}
          alt={product.name}
          width={80}
          height={80}
          className="w-full h-full object-cover"
          fallbackText="Producto"
        />
      </div>

      <div className="ml-4 flex-1">
        <h3 className="text-base font-medium text-gray-800">{product.name}</h3>
        <p className="mt-1 text-sm text-[#b8a089] font-medium">${product.price.toFixed(2)}</p>
      </div>

      <div className="flex items-center">
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            className="px-2 py-1 text-gray-600 hover:bg-[#f0e6db] rounded-l-md"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="px-3 py-1 text-gray-800">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            className="px-2 py-1 text-gray-600 hover:bg-[#f0e6db] rounded-r-md"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          onClick={handleRemove}
          className="ml-4 text-sm text-red-500 hover:text-red-700"
          aria-label="Remove item"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}