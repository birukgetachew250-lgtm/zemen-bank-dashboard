
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/auth';

const protectedRoutes = ['/dashboard', '/corporates', '/customers', '/reports', '/users', '/otp', '/limits', '/roles', '/branches', '/settings', '/mini-apps'];
const publicRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // This is a simplified way to get the session from the cookie.
  // In a real app, you might have an encrypted cookie or a server-side session store.
  const sessionCookie = request.cookies.get('zemen-admin-session');
  const session = sessionCookie ? JSON.parse(sessionCookie.value) : null;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (!session && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }
  
  if (session && isPublicRoute) {
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
     * - unauthorized (the unauthorized page itself)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|unauthorized).*)',
  ],
};
