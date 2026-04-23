'use client';

import React, { memo } from 'react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useTranslations } from 'next-intl';

interface PasswordLoginFormProps {
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  loading: boolean;
  errors: any;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

export const PasswordLoginForm = memo(({
  username,
  setUsername,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  loading,
  errors,
  onSubmit,
  onForgotPassword
}: PasswordLoginFormProps) => {
  const t = useTranslations();

  return (
    <form onSubmit={onSubmit} className="space-y-4 xl:space-y-6 mb-4 xl:mb-6">
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
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-primary text-sm font-bold hover:underline"
        >
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
        <label htmlFor="rememberMe" className="text-sm font-medium text-muted-foreground cursor-pointer select-none">
          {t('auth.login.rememberMe')}
        </label>
      </div>
      <Button type="submit" disabled={loading} className="w-full h-12 text-md font-bold" size="lg">
        {loading ? t('auth.login.buttons.verifying') : t('auth.login.buttons.verify')}
      </Button>
    </form>
  );
});

PasswordLoginForm.displayName = 'PasswordLoginForm';
