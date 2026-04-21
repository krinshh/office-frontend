import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

const intlMiddleware = createMiddleware({
  locales: locales,
  defaultLocale: 'en',
  localeDetection: true
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the user is authenticated via cookie
  const token = request.cookies.get('token')?.value;
  const isAuthenticated = !!token;

  // Define patterns for public vs private routes
  const isLoginPage = pathname.includes('/login');
  const isDashboardPage = pathname.includes('/dashboard') || pathname.includes('/user/');
  const isRootPage = pathname === '/' || locales.some(l => pathname === `/${l}`);

  // 1. If trying to access dashboard/user/root routes without being logged in -> Redirect to login
  if (!isAuthenticated && (isDashboardPage)) {
    const locale = pathname.split('/')[1] || 'en';
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If already logged in and trying to access login/root -> Redirect to dashboard
  if (isAuthenticated && (isLoginPage || isRootPage)) {
    const locale = pathname.split('/')[1] || 'en';
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Otherwise, proceed with the intl middleware (handles locale routing)
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for specific next.js/system paths
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};