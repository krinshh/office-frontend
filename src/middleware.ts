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

  // Exact localized paths
  const locale = locales.find(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`)) || 'en';
  
  const isLoginPage = pathname === `/${locale}/login` || pathname === '/login';
  const isDashboardPage = pathname.startsWith(`/${locale}/dashboard`) || pathname.startsWith(`/${locale}/user/`);
  const isRootPage = pathname === '/' || pathname === `/${locale}`;

  // 1. If trying to access dashboard/user routes without being logged in -> Redirect to login
  if (!isAuthenticated && isDashboardPage) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If already logged in and trying to access login/root -> Redirect to dashboard
  // Only redirect if definitively on the login page to avoid intercepting 404s or other routes
  if (isAuthenticated && (isLoginPage || isRootPage)) {
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