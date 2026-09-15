// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { StudentNav } from '@/Constants';

// ============================================================================
// ROUTE DEFINITIONS
// ============================================================================
//
// THE DEFAULT IS PUBLIC.
//
// This used to work the other way round: three protected zones were listed,
// a handful of public paths were listed, and *everything else* fell through to
// "student zone → redirect to /sign-in". That meant every new public page was
// born protected. `/apply` was the first casualty — a prospective parent
// clicking "Apply for admission" got bounced to the student login, asking for
// an admission number they don't have and will never have unless they apply.
//
// Inverting it is safe because the student portal is a CLOSED set: it renders
// from StudentNav, so if a slug isn't there it isn't a student page. Deriving
// the list from the same constant the router uses means the two can't drift —
// add a section to StudentNav and it's protected automatically.

/** The student portal — exactly the sections the router can render. */
const STUDENT_ROUTES = StudentNav.map((item) => item.url as string);

/** Auth pages for the student portal (no prefix of their own). */
const STUDENT_AUTH_PAGES = [
  '/sign-in',
  '/forgot-password',
  '/check-email',
  '/reset-password',
  '/reset-success',
];

/** Prefixed zones. Everything under these requires a session. */
const PROTECTED_ZONES: {
  prefix: string;
  loginPath: string;
  homePath: string;
  role: string;
}[] = [
  { prefix: '/admin', loginPath: '/admin/sign-in', homePath: '/admin/home', role: 'super_admin' },
  { prefix: '/staff', loginPath: '/staff/sign-in', homePath: '/staff/home', role: 'admin' },
];

/** Auth pages inside the prefixed zones — reachable without a session. */
const ZONE_AUTH_PAGES = [
  '/admin/sign-in',
  '/staff/sign-in',
  '/staff/reset-password',
];

const STUDENT_LOGIN = '/sign-in';

const matches = (pathname: string, route: string) =>
  pathname === route || pathname === `${route}/`;

// ============================================================================
// MIDDLEWARE
// ============================================================================

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Static files and Next internals — never our business.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Middleware can't read localStorage, so the client mirrors its auth state
  // into these cookies on sign-in (see client.ts setToken/setUser).
  const hasAuthCookie = req.cookies.get('tremad_auth_active')?.value === '1';
  const role = req.cookies.get('tremad_user_role')?.value;

  // 2. Auth pages: reachable signed out; bounce a signed-in user to their own
  //    home, but ONLY from their own role's login page. A super admin looking
  //    at the student sign-in page is doing something deliberate.
  const isZoneAuthPage = ZONE_AUTH_PAGES.some((r) => matches(pathname, r));
  const isStudentAuthPage = STUDENT_AUTH_PAGES.some((r) => matches(pathname, r));

  if (isZoneAuthPage || isStudentAuthPage) {
    if (hasAuthCookie) {
      if (role === 'super_admin' && pathname.startsWith('/admin/sign-in')) {
        return NextResponse.redirect(new URL('/admin/home', req.url));
      }
      if (role === 'admin' && pathname.startsWith('/staff/sign-in')) {
        return NextResponse.redirect(new URL('/staff/home', req.url));
      }
      if (
        role === 'student' &&
        (matches(pathname, '/sign-in') || matches(pathname, '/forgot-password'))
      ) {
        return NextResponse.redirect(new URL('/home', req.url));
      }
    }
    return NextResponse.next();
  }

  // 3. Prefixed protected zones (/admin, /staff).
  for (const zone of PROTECTED_ZONES) {
    if (pathname.startsWith(zone.prefix)) {
      if (!hasAuthCookie) {
        const loginUrl = new URL(zone.loginPath, req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }
  }

  // 4. The student portal — an explicit list, not a catch-all.
  const isStudentRoute = STUDENT_ROUTES.some((route) => matches(pathname, route));
  if (isStudentRoute) {
    if (!hasAuthCookie) {
      const loginUrl = new URL(STUDENT_LOGIN, req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 5. Everything else is public: the landing page, /apply, and any marketing
  //    page added later. A genuinely unknown path falls through to Next's own
  //    404, which is the honest answer — far better than pretending it's a
  //    student page and demanding a login for something that doesn't exist.
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
