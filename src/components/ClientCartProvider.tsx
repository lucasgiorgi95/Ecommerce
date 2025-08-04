'use client';

import { CartProvider } from '@/hooks/useCart';
import { ReactNode } from 'react';

export default function ClientCartProvider({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}