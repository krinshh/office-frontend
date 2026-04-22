'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import Input from '@/components/Input';
import { ImagePreview } from '@/components/ImagePreview';
import Card from '@/components/Card';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuthStore } from '@/lib/store';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { api } from '@/lib/api';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Mail from 'lucide-react/dist/esm/icons/mail';

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

  // Load remembered username
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
    // Pre-fetch CSRF token cookie
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/csrf`, { credentials: 'include' }).catch(() => { });
  }, []);

  // Auto-logout if visiting login page while authenticated
  useEffect(() => {
    const autoLogout = async () => {
      if (isAuthenticated) {
        try {
          await api.auth.logout();
        } catch (e) { }

        const theme = localStorage.getItem('theme');
        localStorage.clear();
        if (theme) localStorage.setItem('theme', theme);
        sessionStorage.clear();
        logout(); // Zustand state cleanup
      }
    };
    autoLogout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearErrors();
    setIsLoading(true);

    if (!email) {
      handleError({ type: 'validation', field: 'email', message: t('auth.login.validation.emailRequired') });
      setIsLoading(false);
      return;
    }

    try {
      // Ensure CSRF cookie exists
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
  };

  const handleVerifyOTP = async (e?: React.FormEvent) => {
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
  };

  const handlePasswordLogin = async (e?: React.FormEvent) => {
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
  };

  return (
    <main>
      <div className="w-full h-screen flex flex-col lg:flex-row overflow-hidden bg-background">
        {/* Left Panel: Visual Impact (Hidden on Mobile/Tablets below 1024px) */}
        <div className="hidden lg:flex w-full lg:w-1/2 h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex-col items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute inset-0 z-10 bg-gradient-to-tr from-blue-900 to-transparent" />
          <img
            src="/login-bg.webp"
            alt="Modern Office"
            className="absolute inset-0 w-full h-full object-cover scale-105 animate-pulse-slow"
            style={{ animationDuration: '8s' }}
          />
          <div className="relative z-20 flex flex-col justify-end p-10 w-full h-full text-white">
            <div className="mb-4 xl:mb-8 inline-flex items-center gap-3 px-4 py-2 backdrop-blur-md bg-white/10 rounded-full border border-white/20 self-start animate-fade-in-up">
              <Shield className="w-4 h-4 xl:w-5 xl:h-5 text-white" />
              <span className="text-[10px] xl:text-sm font-bold tracking-wider uppercase">Enterprise Grade Security</span>
            </div>
            <div className="max-w-2xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <h1 className="text-4xl xl:text-7xl lg:text-5xl font-black mb-4 xl:mb-8 leading-[1.1] tracking-tighter drop-shadow-2xl">
                Office Management <br />
                <span className="text-white underline decoration-white/30 underline-offset-8">Simplified.</span>
              </h1>
              <p className="text-lg xl:text-2xl text-white font-medium leading-relaxed">
                Manage your teams, synchronize attendance, and automate payroll with absolute precision.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: Content */}
        <div className="w-full lg:w-1/2 min-h-screen overflow-y-auto relative bg-background">
          {/* Soft-Illumination Gradient (Synced with Dashboard Colors) */}
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
                {/* <div className="mb-10 text-center lg:text-left">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 mb-6 mx-auto lg:mx-0">
                  <Lock className="text-white w-7 h-7" />
                </div>
              <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">
                {t('auth.login.welcomeTitle')}
              </h2>
              <p className="text-muted-foreground">
                {t('auth.login.welcomeSubtitle')}
              </p>
            </div> */}
                <div className="flex justify-center items-center mb-10 xl:mb-20">
                  <ImagePreview
                    src={`/Frame 11.png`}
                    alt="Logo"
                    className="w-60 md:w-70 lg:w-80 h-auto shrink-0 transition-all duration-500 group-hover:brightness-110"
                    thumbnailClassName="w-full h-auto object-contain drop-shadow-sm"
                  />
                </div>
                {/* <div className="logo-placeholder">
                E
              </div> */}
                <div className="flex justify-between items-center">
                  <div className="flex justify-start items-start flex-col mb-4 xl:mb-6">
                    <h1 className="text-2xl font-bold text-foreground overflow-hidden text-ellipsis leading-none pb-1 capitalize">
                      {t('auth.login.welcomeTitle')}</h1>
                    <p className="text-muted-foreground overflow-hidden text-ellipsis leading-none pb-1">
                      {t('auth.login.welcomeSubtitle')}</p>
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

                {loginMethod === 'otp' ? (
                  <div className="space-y-4 xl:space-y-6 mb-4 xl:mb-6">
                    {step === 'credentials' ? (
                      <form onSubmit={handleSendOTP} className="space-y-4 xl:space-y-6">
                        <Input
                          label={t('auth.login.inputs.email')}
                          type="email"
                          name="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.com"
                          error={errors.email}
                          required
                          fullWidth
                        />
                        <Button type="submit" disabled={loading} className="w-full h-12 text-md font-bold" size="lg">
                          {loading ? t('auth.login.buttons.sendingOtp') : t('auth.login.buttons.sendOtp')}
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOTP} className="space-y-4 xl:space-y-6 text-center">
                        <div className="bg-muted/50 p-4 rounded-xl border border-border/50 mb-2">
                          <p className="text-sm text-muted-foreground mb-1">{t('auth.login.otpStep.sentMessage')}</p>
                          <p className="font-bold text-foreground">{email}</p>
                        </div>
                        <Input
                          label={t('auth.login.otpStep.verifyLabel')}
                          type="text"
                          autoComplete="one-time-code"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder={t('auth.login.inputs.otpPlaceholder')}
                          className="text-center text-3xl font-mono tracking-widest h-14"
                          error={errors.otp}
                          required
                        />
                        <Button type="submit" disabled={loading} className="w-full h-12" size="lg">
                          {loading ? t('auth.login.buttons.verifying') : t('auth.login.buttons.verify')}
                        </Button>
                        <button type="button" onClick={() => setStep('credentials')} className="text-sm font-medium text-primary hover:underline">
                          {t('auth.login.buttons.changeEmail')}
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handlePasswordLogin} className="space-y-4 xl:space-y-6 mb-4 xl:mb-6">
                    <Input
                      label={t('auth.login.inputs.username')}
                      type="text"
                      name="username"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t('auth.login.inputs.usernamePlaceholder')}
                      error={errors.username}
                      required
                      fullWidth
                    />
                    <div className="space-y-1">
                      <Input
                        id="password-login"
                        type="password"
                        label={t('auth.login.inputs.password')}
                        name="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        error={errors.password}
                        required
                        fullWidth
                      />
                      <button type="button" onClick={() => router.push('/forgot-password')} className="text-primary text-sm font-bold hover:underline">
                        {t('auth.login.forgotPassword')}
                      </button>
                    </div>
                    <div className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        autoComplete="off"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded-xl border-input text-primary focus:ring-primary h-auto w-auto"
                      />
                      <label htmlFor="rememberMe" className="text-sm font-medium text-muted-foreground cursor-pointer">
                        {t('auth.login.rememberMe')}
                      </label>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-12 text-md font-bold" size="lg">
                      {loading ? t('auth.login.buttons.verifying') : t('auth.login.buttons.verify')}
                    </Button>
                  </form>
                )}

                <p className="text-xs text-muted-foreground sm:leading-none">
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
      </div>
    </main>
  );
}
