// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that should always be accessible (no redirect to coming-soon)
const ACCESSIBLE_ROUTES = [
  '/',
  '/coming-soon',
  '/api',           // Keep API routes accessible
  '/admin',         // Admin panel if you have one
  '/login',         // Login page if needed
  // Add more routes that should bypass coming-soon
];

// Routes for development/testing (you can toggle these)
const DEVELOPMENT_ROUTES = [
  '/',
  '/home',
  '/profile', 
  '/subject-management',
  '/time-table',
  '/results',
  '/payment',
  '/notification',
  '/sign-in',
  '/forgot-password',
  '/check-email',
  '/reset-password',
  '/reset-success',
  '/SuperAdmin/home', 
  '/SuperAdmin/portal-login', 
  '/SuperAdmin/student-management',
  '/SuperAdmin/staff-management',
  '/SuperAdmin/exam-questions', 
  '/SuperAdmin/result-management', 
  '/SuperAdmin/receipts',
  '/SuperAdmin/payment-management', 
  '/SuperAdmin/analyticsandinsight', 
  '/SuperAdmin/notification', 
  '/landing-page', 
  // Add all your app routes here
];

// Set this to true to allow access to development routes
const ALLOW_DEVELOPMENT_ACCESS = true; // Change to false for production

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Always allow Next.js internal routes
  if (
    path.startsWith('/_next') ||
    path.startsWith('/favicon.ico') ||
    path.includes('.')  // Allow static files
  ) {
    return NextResponse.next();
  }
  
  // Check if route is in always accessible list
  if (ACCESSIBLE_ROUTES.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Check if development routes are allowed
  if (ALLOW_DEVELOPMENT_ACCESS && 
      DEVELOPMENT_ROUTES.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Optional: Allow access with a query parameter for testing
  const bypassParam = req.nextUrl.searchParams.get('bypass');
  if (bypassParam === 'true') {
    // Set a cookie to remember the bypass
    const response = NextResponse.next();
    response.cookies.set('bypass-coming-soon', 'true', {
      maxAge: 60 * 60 * 24, // 24 hours
      httpOnly: true,
      sameSite: 'lax',
    });
    return response;
  }
  
  // Check for bypass cookie
  const bypassCookie = req.cookies.get('bypass-coming-soon');
  if (bypassCookie?.value === 'true') {
    return NextResponse.next();
  }
  
  // If it's the root path, redirect to coming-soon
  if (path === '/') {
    return NextResponse.redirect(new URL('/coming-soon', req.url));
  }
  
  // For all other routes, redirect to coming-soon
  return NextResponse.redirect(new URL('/coming-soon', req.url));
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