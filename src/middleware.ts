import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/corporates', '/customers', '/reports', '/users', '/otp', '/limits', '/roles', '/branches', '/settings', '/mini-apps'];
const publicRoutes = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // In a real app, the session token would be from a Firebase auth state listener.
  // For this prototype, we're checking a mock session cookie.
  const sessionCookie = request.cookies.get('firebase-auth-mock-state') || request.cookies.get('session');

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  
  if (publicRoutes.includes(pathname) && sessionCookie) {
     const url = request.nextUrl.clone();
     url.pathname = '/dashboard';
     return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|firebase-config).*)',
  ],
};
