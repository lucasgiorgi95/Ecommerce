'use client';

import { useAuthMiddleware, useTokenRefresh } from '@/lib/authMiddleware';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  fallback?: ReactNode;
}

/**
 * Protected Route Component
 * Wraps children with authentication middleware
 */
export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  fallback 
}: ProtectedRouteProps) {
  const { shouldRender, isLoading } = useAuthMiddleware(requireAuth);
  
  // Use token refresh hook
  useTokenRefresh();

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-lg text-gray-600">Cargando...</div>
        </div>
      </div>
    );
  }

  // Show fallback or nothing if not authenticated
  if (!shouldRender) {
    return fallback || null;
  }

  return <>{children}</>;
}