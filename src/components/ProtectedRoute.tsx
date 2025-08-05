"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no requiere autenticación, no hacer nada
    if (!requireAuth) return;

    // Si no está cargando y no está autenticado, redirigir
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname;
      const redirectUrl = redirectTo === '/login' 
        ? `/login?redirect=${encodeURIComponent(currentPath)}`
        : redirectTo;
      router.push(redirectUrl);
      return;
    }

    // Si requiere admin y no es admin, redirigir al home
    if (!isLoading && isAuthenticated && requireAdmin && user && user.role !== 'admin') {
      // Mostrar mensaje de acceso denegado por un momento antes de redirigir
      setTimeout(() => {
        router.push('/');
      }, 2000);
      return;
    }
  }, [isLoading, isAuthenticated, user, router, requireAuth, requireAdmin, redirectTo]);

  // Mostrar loading mientras se verifica la autenticación
  if (requireAuth && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b8a089] mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // No mostrar nada si requiere auth y no está autenticado (se está redirigiendo)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Mostrar mensaje de acceso denegado si requiere admin y no es admin
  if (requireAdmin && isAuthenticated && user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder a esta sección.</p>
          <p className="text-sm text-gray-500">Redirigiendo al inicio...</p>
        </div>
      </div>
    );
  }

  // No mostrar nada si requiere admin y no es admin (otros casos)
  if (requireAdmin && (!user || user.role !== 'admin')) {
    return null;
  }

  // Si llegó hasta aquí, tiene los permisos necesarios
  return <>{children}</>;
}