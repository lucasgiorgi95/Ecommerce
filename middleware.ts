import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Define protected routes that require authentication
const protectedRoutes = ['/checkout'];

// Define routes that should redirect authenticated users away
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '') ||
                // Fallback to check for token in localStorage (handled client-side)
                null;

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Handle protected routes
  if (isProtectedRoute) {
    // If no token, redirect to login with return URL
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token
    try {
      verifyToken(token);
      // Token is valid, allow access
      return NextResponse.next();
    } catch (error) {
      // Token is invalid or expired, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      
      // Clear invalid token cookie if it exists
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('token');
      
      return response;
    }
  }

  // Handle auth routes (login/register)
  if (isAuthRoute && token) {
    try {
      verifyToken(token);
      // User is already authenticated, redirect to home or specified redirect
      const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    } catch (error) {
      // Token is invalid, clear it and allow access to auth routes
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }

  // For all other routes, continue normally
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};