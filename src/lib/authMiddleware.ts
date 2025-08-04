import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
// Funciones JWT seguras para el cliente (sin JWT_SECRET)
function isTokenCloseToExpirationClient(token: string, thresholdMinutes: number = 60): boolean {
  try {
    // Decodificar el token sin verificar (solo para obtener la fecha de expiración)
    const base64Url = token.split('.')[1];
    if (!base64Url) return true;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    if (!decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - currentTime;
    const thresholdSeconds = thresholdMinutes * 60;

    return timeUntilExpiry <= thresholdSeconds;
  } catch {
    return true; // Si hay error, considerar como expirado
  }
}

function getTokenExpirationClient(token: string): Date | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    if (!decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}

/**
 * Client-side authentication middleware hook
 * Handles token verification and automatic redirects
 */
export function useAuthMiddleware(requireAuth: boolean = true) {
  const { isAuthenticated, isLoading, verifyToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (isLoading) return;

      if (requireAuth && !isAuthenticated) {
        // Get current path for redirect after login
        const currentPath = window.location.pathname;
        const redirectUrl = currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
        router.push(`/login${redirectUrl}`);
        return;
      }

      // If authenticated, verify token is still valid
      if (isAuthenticated) {
        const isValid = await verifyToken();
        if (!isValid && requireAuth) {
          // Token expired, redirect to login
          const currentPath = window.location.pathname;
          const redirectUrl = currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
          router.push(`/login${redirectUrl}`);
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, requireAuth, router, verifyToken]);

  return {
    isAuthenticated,
    isLoading,
    shouldRender: !requireAuth || (isAuthenticated && !isLoading)
  };
}

/**
 * Token refresh utility
 * Checks if token is close to expiration and refreshes if needed
 */
export function useTokenRefresh() {
  const { verifyToken, refreshToken, logout } = useAuth();

  useEffect(() => {
    const checkTokenExpiration = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // Check if token is close to expiration (within 1 hour)
        if (isTokenCloseToExpiration(token, 60)) {
          console.log('Token is close to expiration, attempting refresh...');
          
          // Try to refresh the token first
          const refreshed = await refreshToken();
          
          if (refreshed) {
            console.log('Token refreshed successfully');
            return;
          }
          
          // If refresh failed, try verification
          console.log('Token refresh failed, verifying current token...');
          const isValid = await verifyToken();
          
          if (!isValid) {
            console.log('Token is expired or invalid, logging out...');
            logout();
            return;
          }
          
          console.log('Token verified successfully');
        }

        // Log token expiration for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
          const expiration = getTokenExpiration(token);
          if (expiration) {
            console.log('Token expires at:', expiration.toLocaleString());
          }
        }
      } catch (error) {
        console.error('Error checking token expiration:', error);
        // On error, verify token to be safe
        const isValid = await verifyToken();
        if (!isValid) {
          logout();
        }
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Set up interval to check every 15 minutes
    const interval = setInterval(checkTokenExpiration, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [verifyToken, refreshToken, logout]);
}

/**
 * Higher-order component for protecting routes
 */
export function withAuth<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  requireAuth: boolean = true
) {
  return function AuthenticatedComponent(props: T) {
    const { shouldRender, isLoading } = useAuthMiddleware(requireAuth);

    // Use token refresh hook
    useTokenRefresh();

    if (isLoading) {
      return null; // Let the component handle loading state
    }

    if (!shouldRender) {
      return null; // Will redirect via useAuthMiddleware
    }

    return React.createElement(WrappedComponent, props);
  };
}