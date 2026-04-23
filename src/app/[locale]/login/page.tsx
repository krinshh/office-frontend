'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import NextImage from 'next/image';
import Alert from '@/components/Alert';
import Image from '@/components/Image';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useAuthStore } from '@/lib/store';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { api } from '@/lib/api';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Mail from 'lucide-react/dist/esm/icons/mail';

// Dynamically import components to break up the initial JS payload
const VisualImpact = dynamic(() => import('./VisualImpact').then(mod => mod.VisualImpact), {
  ssr: true,
  loading: () => <div className="hidden lg:flex w-full lg:w-1/2 h-full bg-slate-900" />
});

const PasswordLoginForm = dynamic(() => import('./PasswordLoginForm').then(mod => mod.PasswordLoginForm), {
  ssr: true
});

const OTPLoginForm = dynamic(() => import('./OTPLoginForm').then(mod => mod.OTPLoginForm), {
  ssr: true
});

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated, login, logout } = useAuthStore();
  const { errors, success, loading, setIsLoading, handleError, handleSuccess, clearErrors } = useErrorHandler(t);

  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('password');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [rememberMe, setRememberMe] = useState(false);

  // Performance Optimization: Defer non-critical initializations
  useEffect(() => {
    const deferInitialization = () => {
      // Load remembered username
      const savedUsername = localStorage.getItem('rememberedUsername');
      if (savedUsername) {
        setUsername(savedUsername);
        setRememberMe(true);
      }

      // Pre-fetch CSRF token session (low priority)
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/csrf`, { credentials: 'include' }).catch(() => { });
    };

    // Use requestIdleCallback if available, fallback to setTimeout
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(deferInitialization);
    } else {
      setTimeout(deferInitialization, 1);
    }
  }, []);

  // Performance Optimization: Defer auth check to prevent hydration blocking
  useEffect(() => {
    // Only perform auto-logout if the user was ALREADY authenticated when they arrived
    if (!isAuthenticated) return;

    const performAutoLogout = async () => {
      try {
        await api.auth.logout();
      } catch (e) { }

      const theme = localStorage.getItem('theme');
      localStorage.clear();
      if (theme) localStorage.setItem('theme', theme);
      sessionStorage.clear();
      logout();
    };

    const timer = setTimeout(performAutoLogout, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run ONLY on mount

  const handleSendOTP = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearErrors();
    setIsLoading(true);

    if (!email) {
      handleError({ type: 'validation', field: 'email', message: t('auth.login.validation.emailRequired') });
      setIsLoading(false);
      return;
    }

    try {
      const csrfCookie = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
      if (!csrfCookie) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/csrf`, { credentials: 'include' });
      }
      const csrfToken = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)?.[1] ?? '';

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': decodeURIComponent(csrfToken) },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        handleSuccess(t('login.otpSent', { email }));
        setStep('otp');
      } else {
        if (data.code === 'USER_NOT_FOUND' || data.code === 'EMAIL_NOT_FOUND' || response.status === 404) {
          handleError({ type: 'validation', field: 'email', message: t('apiErrors.userNotFound') });
        } else {
          handleError(data);
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [email, clearErrors, setIsLoading, handleError, handleSuccess, t]);

  const handleVerifyOTP = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearErrors();
    setIsLoading(true);

    if (!otp) {
      handleError({ type: 'validation', field: 'otp', message: t('auth.login.validation.otpRequired') });
      setIsLoading(false);
      return;
    }
    if (otp.length !== 6) {
      handleError({ type: 'validation', field: 'otp', message: t('auth.login.validation.otpLength') });
      setIsLoading(false);
      return;
    }

    try {
      const theme = localStorage.getItem('theme');
      localStorage.clear();
      if (theme) localStorage.setItem('theme', theme);
      sessionStorage.clear();

      const csrfToken = decodeURIComponent(document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)?.[1] ?? '');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ email, otp }),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user, data.token);
        router.push('/dashboard');
      } else {
        if (data.code === 'USER_NOT_FOUND' || data.code === 'EMAIL_NOT_FOUND' || response.status === 404) {
          handleError({ type: 'validation', field: 'otp', message: t('apiErrors.userNotFound') });
        } else {
          handleError(data);
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [email, otp, clearErrors, setIsLoading, handleError, login, router, t]);

  const handlePasswordLogin = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearErrors();
    setIsLoading(true);

    let hasErrors = false;
    if (!username) {
      handleError({ type: 'validation', field: 'username', message: t('auth.login.validation.usernameRequired') });
      hasErrors = true;
    }
    if (!password) {
      handleError({ type: 'validation', field: 'password', message: t('auth.login.validation.passwordRequired') });
      hasErrors = true;
    }

    if (hasErrors) {
      setIsLoading(false);
      return;
    }

    try {
      const theme = localStorage.getItem('theme');
      localStorage.clear();
      if (theme) localStorage.setItem('theme', theme);
      sessionStorage.clear();

      const csrfToken = decodeURIComponent(document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)?.[1] ?? '');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', username);
        } else {
          localStorage.removeItem('rememberedUsername');
        }
        login(data.user, data.token);
        router.push('/dashboard');
      } else {
        if (data.code === 'USER_NOT_FOUND' || data.code === 'INVALID_CREDENTIALS' || response.status === 401 || response.status === 404) {
          const msg = (data.code === 'USER_NOT_FOUND' || response.status === 404) ? t('apiErrors.userNotFound') : t('apiErrors.invalidCredentials');
          handleError({ type: 'validation', field: 'username', message: msg });
        } else {
          handleError(data);
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [username, password, rememberMe, clearErrors, setIsLoading, handleError, login, router, t]);

  return (
    <main className="w-full h-screen flex flex-col lg:flex-row overflow-hidden bg-background">
      {/* Left Panel: Optimized via Dynamic Import & Memoization */}
      <VisualImpact />

      {/* Right Panel: Content */}
      <div className="w-full lg:w-1/2 min-h-screen overflow-y-auto relative bg-background">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-full h-[60%] bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.15),transparent_70%)] opacity-70" />
          <div className="absolute bottom-0 right-1/4 w-full h-[60%] bg-[radial-gradient(ellipse_at_bottom,_hsl(var(--secondary)/0.1),transparent_70%)] opacity-50" />
        </div>

        <div className="min-h-full w-full flex flex-col items-center justify-center px-6 md:px-20 lg:px-10 xl:px-[5.5vw] relative z-10">
          <div className="w-full">
            <div className="lg:hidden flex justify-end mb-6 gap-2 [&_span]:!inline relative z-20">
              <ThemeToggle />
              <LanguageSwitcher variant="primary" />
            </div>

            <div className="bg-card/80 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border lg:border-none border-border/50 shadow-xl lg:shadow-none rounded-[20px] lg:rounded-none p-6 md:p-8 lg:p-0">
              <div className="flex justify-center items-center mb-10 xl:mb-20">
                <div className="group cursor-pointer">
                  <NextImage
                    src="/Frame 11.png"
                    alt="Logo"
                    width={320}
                    height={80}
                    priority
                    className="w-60 md:w-70 lg:w-80 h-auto shrink-0 transition-all duration-500 group-hover:brightness-110 drop-shadow-sm"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex justify-start items-start flex-col mb-4 xl:mb-6">
                  <h1 className="text-2xl font-bold text-foreground overflow-hidden text-ellipsis leading-none pb-1 capitalize">
                    {t('auth.login.welcomeTitle')}
                  </h1>
                  <p className="text-muted-foreground overflow-hidden text-ellipsis leading-none pb-1">
                    {t('auth.login.welcomeSubtitle')}
                  </p>
                </div>

                <div className="hidden lg:flex justify-end gap-2 [&_span]:!inline relative z-20">
                  <ThemeToggle />
                  <LanguageSwitcher variant="primary" />
                </div>
              </div>

              {/* Login Methods Tabs */}
              <div className="inline-flex mb-4 xl:mb-6 w-full border-b-2 border-b-border">
                <button
                  onClick={() => { setLoginMethod('password'); clearErrors(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all duration-200 ${loginMethod === 'password' ? 'text-primary border-b-2 border-b-primary' : 'text-foreground'}`}
                >
                  <Lock className="w-4 h-4" />
                  {t('auth.login.methods.password')}
                </button>
                <button
                  onClick={() => { setLoginMethod('otp'); clearErrors(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all duration-200 ${loginMethod === 'otp' ? 'text-primary border-b-2 border-b-primary' : 'text-foreground'}`}
                >
                  <Mail className="w-4 h-4" />
                  {t('auth.login.methods.otp')}
                </button>
              </div>

              {errors.general && <Alert type="error" message={errors.general} className="mb-6 animate-fade-in" />}
              {success && <Alert type="success" message={success} className="mb-6 animate-fade-in" />}

              {loginMethod === 'password' ? (
                <PasswordLoginForm
                  username={username}
                  setUsername={setUsername}
                  password={password}
                  setPassword={setPassword}
                  rememberMe={rememberMe}
                  setRememberMe={setRememberMe}
                  loading={loading}
                  errors={errors}
                  onSubmit={handlePasswordLogin}
                  onForgotPassword={() => router.push('/forgot-password')}
                />
              ) : (
                <OTPLoginForm
                  step={step}
                  email={email}
                  setEmail={setEmail}
                  otp={otp}
                  setOtp={setOtp}
                  loading={loading}
                  errors={errors}
                  onSendOTP={handleSendOTP}
                  onVerifyOTP={handleVerifyOTP}
                  onChangeEmail={() => setStep('credentials')}
                />
              )}

              <p className="text-xs text-muted-foreground sm:leading-none mt-4">
                {t.rich('auth.login.termsAndPrivacy', {
                  terms: (chunks) => <a href="#" onClick={(e) => e.preventDefault()} className="text-primary hover:underline font-bold">{chunks}</a>,
                  privacy: (chunks) => <a href="#" onClick={(e) => e.preventDefault()} className="text-primary hover:underline font-bold">{chunks}</a>
                })}
              </p>
              {/* 
              <div className="mt-12">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                  © 2026 Office Management System
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
