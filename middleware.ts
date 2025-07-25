import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Protect dashboard routes
  const pathname = request.nextUrl.pathname;

  // Routes that require authentication
  const protectedRoutes = [
    '/brand/dashboard',
    '/brand/settings',
    '/creator/dashboard',
    '/creator/settings'
  ];

  // Check if the current route is protected
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    // Check for session cookie
    const sessionCookie = request.cookies.get('better-auth.session_token');

    if (!sessionCookie) {
      // No session cookie, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Note: We can't verify the session or check user type in Edge Runtime
    // That validation will happen in the API routes and client-side
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 