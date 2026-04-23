'use client';

import React from 'react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useTranslations } from 'next-intl';

interface OTPLoginFormProps {
  step: 'credentials' | 'otp';
  email: string;
  setEmail: (val: string) => void;
  otp: string;
  setOtp: (val: string) => void;
  loading: boolean;
  errors: any;
  onSendOTP: (e: React.FormEvent) => void;
  onVerifyOTP: (e: React.FormEvent) => void;
  onChangeEmail: () => void;
}

export function OTPLoginForm({
  step,
  email,
  setEmail,
  otp,
  setOtp,
  loading,
  errors,
  onSendOTP,
  onVerifyOTP,
  onChangeEmail
}: OTPLoginFormProps) {
  const t = useTranslations();

  if (step === 'credentials') {
    return (
      <form onSubmit={onSendOTP} className="space-y-4 xl:space-y-6 mb-4 xl:mb-6">
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
    );
  }

  return (
    <form onSubmit={onVerifyOTP} className="space-y-4 xl:space-y-6 mb-4 xl:mb-6 text-center">
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
      <button type="button" onClick={onChangeEmail} className="text-sm font-medium text-primary hover:underline">
        {t('auth.login.buttons.changeEmail')}
      </button>
    </form>
  );
}
