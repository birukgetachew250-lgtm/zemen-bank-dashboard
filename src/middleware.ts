
export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - login (the login page itself)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|login).*)',
  ],
};
