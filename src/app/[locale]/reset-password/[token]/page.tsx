'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Alert from '@/components/Alert';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ImagePreview } from '@/components/ImagePreview';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Lock from 'lucide-react/dist/esm/icons/lock';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Zap from 'lucide-react/dist/esm/icons/zap';
import ShieldAlert from 'lucide-react/dist/esm/icons/shield-alert';
import ScanFace from 'lucide-react/dist/esm/icons/scan-face';
import { VALID_REGEX } from '@/constants/regex';

export default function ResetPasswordABCPage() {
    const t = useTranslations();
    const params = useParams();
    const router = useRouter();
    const { errors, success, loading, setIsLoading, handleError, handleSuccess, clearErrors } = useErrorHandler(t);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Pre-fetch CSRF token
        fetch(`/api/auth/csrf`, { credentials: 'include' }).catch(() => { });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        setIsLoading(true);

        if (password !== confirmPassword) {
            handleError({ type: 'validation', field: 'confirmPassword', message: t('auth.resetPassword.errors.mismatch') });
            setIsLoading(false);
            return;
        }

        if (!VALID_REGEX.PASSWORD.test(password)) {
            handleError({ type: 'validation', field: 'password', message: t('apiErrors.weakPassword') });
            setIsLoading(false);
            return;
        }

        try {
            const resetToken = params.token;

            const response = await fetch(`/api/auth/reset-password/${resetToken}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': decodeURIComponent(document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)?.[1] ?? ''),
                },
                body: JSON.stringify({ password }),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                handleSuccess(t('auth.resetPassword.success'));
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                if (data.code === 'WEAK_PASSWORD') {
                    handleError({ type: 'validation', field: 'password', message: t('apiErrors.weakPassword') });
                } else if (data.code === 'INVALID_TOKEN' || data.code === 'UNAUTHORIZED') {
                    handleError({ type: 'general', message: t('apiErrors.invalidToken') });
                } else {
                    handleError(data);
                }
            }
        } catch (err: any) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="w-full h-screen flex flex-col lg:flex-row overflow-hidden bg-background">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float {
                    0%, 100% { transform: translateY(0px); opacity: 0.15; }
                    50% { transform: translateY(-20px); opacity: 0.25; }
                }
                @keyframes drift {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(10px, -10px); }
                    50% { transform: translate(-10px, 10px); }
                    75% { transform: translate(15px, 5px); }
                }
                @keyframes fadeInUpCustom {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-drift { animation: drift 20s infinite; }
                .blob { position: absolute; border-radius: 50%; mix-blend-mode: screen; filter: blur(40px); }
                
                @keyframes pulse-slow-custom {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.3; transform: scale(1.1); }
                }
                .animate-pulse-slow { animation: pulse-slow-custom 8s ease-in-out infinite; }
                
                @keyframes fade-in-up-custom {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up-custom 0.8s ease-out forwards; }
                
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(-5%); }
                    50% { transform: translateY(0); }
                }
                .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
            `}} />

            {/* Left Side - 100% Theme-Pure Power Panel */}
            <div className="hidden lg:flex lg:w-1/2 h-full bg-foreground dark:bg-background border-r border-border/50 flex-col relative overflow-hidden transition-colors duration-500">
                {/* Dynamic Theme Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-foreground dark:from-background via-primary/20 to-foreground dark:to-background" />
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

                <div
                    className="absolute inset-0 opacity-[0.05] dark:opacity-10"
                    style={{
                        backgroundImage: `linear-gradient(0deg, currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
                        backgroundSize: '80px 80px'
                    }}
                />

                {/* Content Wrapper (No Scroll) */}
                <div className="w-full h-full relative z-20">
                    <div className="min-h-full w-full flex flex-col items-center justify-center p-8 lg:p-12">
                        <div className="text-center text-background dark:text-foreground max-w-md 2xl:max-w-lg animate-fade-in-up">
                            <div className="mb-10 inline-flex items-center justify-center w-24 h-24 2xl:w-32 2xl:h-32 bg-primary shadow-2xl shadow-primary/20 rounded-3xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent group-hover:scale-110 transition-transform duration-500" />
                                <Lock className="w-12 h-12 2xl:w-16 2xl:h-16 text-primary-foreground relative z-10" />
                            </div>

                            <h1 className="text-5xl 2xl:text-7xl font-black mb-6 bg-gradient-to-br from-background dark:from-foreground to-background/70 dark:to-foreground/70 bg-clip-text text-transparent leading-tight tracking-tighter drop-shadow-2xl">
                                Credential <br /> Update
                            </h1>

                            <p className="text-xl 2xl:text-2xl text-background/80 dark:text-foreground/80 font-light leading-relaxed mb-12">
                                Protect your professional account by updating your credentials through our encrypted gateway.
                            </p>

                            <div className="space-y-4 w-full max-w-xs mx-auto">
                                {[
                                    { icon: <ShieldCheck className="w-5 h-5" />, text: 'Policy Compliant' },
                                    { icon: <ShieldCheck className="w-5 h-5" />, text: 'Identity Verified' },
                                    { icon: <Zap className="w-5 h-5" />, text: 'Instant Protection' }
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-center gap-4 py-4 px-6 bg-background/5 dark:bg-foreground/5 backdrop-blur-md rounded-2xl border border-background/20 dark:border-foreground/20 transition-all hover:bg-background/10 dark:hover:bg-foreground/10"
                                        style={{ animationDelay: `${0.2 * i}s` }}
                                    >
                                        <div className="text-primary-foreground dark:text-primary">{item.icon}</div>
                                        <span className="text-xs font-black tracking-widest uppercase text-background/90 dark:text-foreground/90">{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 h-0.5 w-full bg-gradient-to-r from-transparent via-background/20 dark:via-foreground/20 to-transparent" />
                        </div>
                    </div>
                </div>

                {/* High-Visibility Background Symbols (Theme-Pure) */}
                <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.08] dark:opacity-[0.15]">
                    <Lock className="absolute top-[10%] left-[15%] w-24 h-24 text-background dark:text-foreground rotate-12 animate-bounce-slow" />
                    <ShieldCheck className="absolute top-[55%] right-[10%] w-32 h-32 text-background dark:text-foreground -rotate-12 animate-bounce-slow" style={{ animationDelay: '1.5s' }} />
                    <ScanFace className="absolute bottom-[15%] left-[10%] w-28 h-28 text-background dark:text-foreground rotate-6 animate-bounce-slow" style={{ animationDelay: '3s' }} />
                </div>
            </div>

            {/* Right Panel: Content */}
            <div className="w-full lg:w-1/2 min-h-screen overflow-y-auto relative bg-background">
                {/* Decorative Gradients */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-full h-[60%] bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.12),transparent_70%)] opacity-70" />
                    <div className="absolute bottom-0 right-1/4 w-full h-[60%] bg-[radial-gradient(ellipse_at_bottom,_hsl(var(--secondary)/0.08),transparent_70%)] opacity-50" />
                </div>

                <div className="min-h-full w-full flex flex-col items-center justify-center px-6 md:px-20 lg:px-10 xl:px-[5.5vw] relative z-10">
                    <div className="w-full">
                        {/* Header Actions */}
                        <div className="lg:hidden flex justify-end mb-6 gap-2 [&_span]:!inline relative z-20">
                            <ThemeToggle />
                            <LanguageSwitcher variant="primary" />
                        </div>

                        {/* Content Area */}
                        <div className="bg-card/80 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border lg:border-none border-border/50 shadow-xl lg:shadow-none rounded-[20px] lg:rounded-none p-6 md:p-8 lg:p-0">

                            {/* Logo */}
                            <div className="flex justify-center items-center mb-8 xl:mb-20">
                                <ImagePreview
                                    src={`/Frame 11.png`}
                                    alt="Logo"
                                    className="w-60 md:w-70 lg:w-80 h-auto shrink-0 transition-all duration-500 group-hover:brightness-110"
                                    thumbnailClassName="w-full h-auto object-contain drop-shadow-sm"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex justify-start items-start flex-col mb-4 xl:mb-6">
                                    <h1 className="text-2xl font-bold text-foreground overflow-hidden text-ellipsis leading-none pb-1 capitalize">
                                        {t('auth.resetPassword.title')}</h1>
                                    <p className="text-muted-foreground overflow-hidden text-ellipsis leading-none pb-1">
                                        {t('auth.resetPassword.subtitle')}</p>
                                </div>
                                <div className="hidden lg:flex justify-end gap-2 [&_span]:!inline relative z-20">
                                    <ThemeToggle />
                                    <LanguageSwitcher variant="primary" />
                                </div>
                            </div>

                            {errors.general && <Alert type="error" message={errors.general} className="mb-6 animate-shake" />}
                            {success && <Alert type="success" message={success} className="mb-6 animate-scale-in" />}

                            {success ? (
                                <div className="text-center py-6">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/10 text-secondary mb-6 animate-bounce-slow">
                                        <CheckCircle className="w-10 h-10" />
                                    </div>
                                    <p className="text-muted-foreground animate-pulse">
                                        Redirecting to login in few seconds...
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4 xl:space-y-6">
                                    <Input
                                        label={t('auth.resetPassword.newPasswordLabel')}
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        error={errors.password}
                                        required
                                        fullWidth
                                    />

                                    <Input
                                        label={t('auth.resetPassword.confirmPasswordLabel')}
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        autoComplete="new-password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        error={errors.confirmPassword}
                                        required
                                        fullWidth
                                    />

                                    {/* <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="show-password"
                                            checked={showPassword}
                                            onChange={() => setShowPassword(!showPassword)}
                                            className="w-4 h-4 rounded-lg border-border text-primary focus:ring-primary/30 transition-all cursor-pointer"
                                        />
                                        <label htmlFor="show-password" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none">
                                            Show password
                                        </label>
                                    </div> */}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 text-md font-bold"
                                        size="lg"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-3">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                {t('auth.resetPassword.resetting')}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                {t('auth.resetPassword.submitButton')}
                                                <ArrowRight className="w-5 h-5 ml-1 animate-pulse-slow" />
                                            </span>
                                        )}
                                    </Button>

                                    <div className="text-center mb-4 xl:mb-6">
                                        <button
                                            type="button"
                                            onClick={() => router.push('/login')}
                                            className="text-sm font-bold text-muted-foreground hover:text-primary transition-all flex items-center justify-start gap-2 group leading-none"
                                        >
                                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                            {t('auth.resetPassword.backToLogin')}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <p className="text-xs text-muted-foreground sm:leading-none">
                                {t.rich('auth.resetPassword.footerTerms', {
                                    security: (chunks) => <a href="#" onClick={(e) => e.preventDefault()} className="text-primary hover:underline font-bold transition-all">{chunks}</a>,
                                    privacy: (chunks) => <a href="#" onClick={(e) => e.preventDefault()} className="text-primary hover:underline font-bold transition-all">{chunks}</a>
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
