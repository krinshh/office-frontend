'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/lib/store';
import { api, ensureCsrf } from '@/lib/api';
import { SettingsProvider } from '@/lib/settingsContext';
import { ThemeProvider } from '@/lib/themeContext';
import { ToastContainer } from './ToastContainer';

// Lazy load heavy providers - not needed on initial landing page load
const SocketProvider = dynamic(() => import('./providers/SocketProvider').then(mod => mod.SocketProvider), { ssr: false });
const PushProvider = dynamic(() => import('./providers/PushProvider').then(mod => mod.PushProvider), { ssr: false });

export function Providers({ children }: { children: React.ReactNode }) {
  const login = useAuthStore((state) => state.login);
  const [authValidated, setAuthValidated] = useState(false);
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      },
    },
  }));

  useEffect(() => {
    const syncAuth = async (force = false) => {
      try {
        // Skip auth check if on a public page to avoid unnecessary 401 console errors or redirect loops
        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          const isLoginPage = pathname.includes('/login');
          const isRecoveryPage = pathname.includes('/forgot-password') || pathname.includes('/reset-password');
          const isRootPage = pathname === '/' || /^\/(en|hi|gu)\/?$/.test(pathname);
          
          if (isLoginPage || isRootPage || isRecoveryPage) {
            setAuthValidated(true);
            return;
          }
        }

        // Zero-Get Guard: If already authenticated with user data, skip re-fetching
        // UNLESS we are forcing a re-verify (like on back-button/bfcache)
        if (!force && useAuthStore.getState().isAuthenticated && useAuthStore.getState().user) {
          console.log('Providers: Auth verified from cache (Zero GET)');
          if (!useAuthStore.getState().token) {
            useAuthStore.getState().login(useAuthStore.getState().user!, 'cookie-session');
          }
          setAuthValidated(true);
          return;
        }

        const response = await api.auth.getMe();

        if (response.ok) {
          const user = await response.json();
          login({
            ...user,
            id: user._id,
          }, 'cookie-session');
        } else if (response.status === 401 || response.status === 403) {
          // api.ts will handle the hard redirect to root
          return;
        }
      } catch (error) {
        // network error
      } finally {
        setAuthValidated(true);
      }
    };

    syncAuth();

    // Kill BF Cache Ghosting: Force a real server check when page is restored from browser memory
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log('Providers: Page restored from cache, forcing server-side verify...');
        syncAuth(true); // <--- Force server check
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [login]);

  // Render children immediately - auth validation happens in background
  // Only show spinner on protected routes that need user data

  return (
    <Suspense fallback={null}>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <ThemeProvider>
            <SocketProvider>
              <PushProvider>
                <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
                  {children}
                </div>
                <ToastContainer />
              </PushProvider>
            </SocketProvider>
          </ThemeProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </Suspense>
  );
}