

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/corporates', '/customers', '/reports', '/users', '/otp', '/limits', '/roles', '/branches', '/settings', '/mini-apps'];
const publicRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const sessionCookie = request.cookies.get('zemen-admin-session');
  let session = null;
  if (sessionCookie) {
    try {
      session = JSON.parse(sessionCookie.value);
    } catch (e) {
      console.error("Failed to parse session cookie", e);
    }
  }

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Hardcode access for admin@zemen.com
  const isAdminUser = session?.user?.email === 'admin@zemen.com';

  if (!session && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  if (session && !isAdminUser && isProtectedRoute) {
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
