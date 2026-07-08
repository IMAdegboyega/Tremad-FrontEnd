// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// ROUTE DEFINITIONS
// ============================================================================

// Public routes — always accessible without auth
const PUBLIC_ROUTES = [
  '/',
  '/sign-in',
  '/forgot-password',
  '/check-email',
  '/reset-password',
  '/reset-success',
  '/coming-soon',
  '/landing-page',
  '/SuperAdmin/sign-in',
  '/Admin/sign-in',
  '/Admin/reset-password',
];

// Auth pages — if user IS logged in, redirect them away from these
const AUTH_PAGES = [
  '/sign-in',
  '/forgot-password',
  '/check-email',
  '/reset-password',
  '/reset-success',
  '/SuperAdmin/sign-in',
  '/Admin/sign-in',
  '/Admin/reset-password',
];

// Protected route prefixes and their login redirects
const PROTECTED_ZONES: { prefix: string; loginPath: string; homePath: string }[] = [
  { prefix: '/SuperAdmin', loginPath: '/SuperAdmin/sign-in', homePath: '/SuperAdmin/home' },
  { prefix: '/Admin', loginPath: '/Admin/sign-in', homePath: '/Admin/home' },
];

// Student routes (no prefix — everything else that's not SuperAdmin/Admin)
const STUDENT_LOGIN = '/sign-in';
const STUDENT_HOME = '/home';

// Token key — must match what client.ts uses
const TOKEN_KEY = 'tremad_auth_token';

// ============================================================================
// MIDDLEWARE
// ============================================================================

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Always allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files (.svg, .ico, .css, .js, etc.)
  ) {
    return NextResponse.next();
  }

  // 2. Check for auth token
  // Next.js middleware can't read localStorage, so we check cookies.
  // The token can be stored as a cookie OR we check a cookie flag.
  // For localStorage-based auth, we use a lightweight cookie sync approach:
  // The client sets a cookie 'tremad_auth_active=1' when token exists.
  const hasAuthCookie = req.cookies.get('tremad_auth_active')?.value === '1';

  // 3. Public routes — always accessible
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname === route + '/'
  );

  if (isPublicRoute) {
    // Only redirect if the user is visiting their OWN role's auth page
    if (hasAuthCookie) {
      const role = req.cookies.get('tremad_user_role')?.value;

      const isSuperAdminOnSuperAdminAuth = role === 'super_admin' && pathname.startsWith('/SuperAdmin/sign-in');
      const isAdminOnAdminAuth = role === 'admin' && pathname.startsWith('/Admin/sign-in');
      const isStudentOnStudentAuth = role === 'student' && (
        pathname === '/sign-in' || pathname === '/sign-in/' ||
        pathname === '/forgot-password' || pathname === '/forgot-password/'
      );

      if (isSuperAdminOnSuperAdminAuth) {
        return NextResponse.redirect(new URL('/SuperAdmin/home', req.url));
      }
      if (isAdminOnAdminAuth) {
        return NextResponse.redirect(new URL('/Admin/home', req.url));
      }
      if (isStudentOnStudentAuth) {
        return NextResponse.redirect(new URL('/home', req.url));
      }
    }
    return NextResponse.next();
  }

  // 4. Protected zone check
  for (const zone of PROTECTED_ZONES) {
    if (pathname.startsWith(zone.prefix)) {
      if (!hasAuthCookie) {
        // Not authenticated — redirect to zone's login
        const loginUrl = new URL(zone.loginPath, req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      // Authenticated — allow through
      return NextResponse.next();
    }
  }

  // 5. All other routes = student zone
  if (!hasAuthCookie) {
    const loginUrl = new URL(STUDENT_LOGIN, req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
