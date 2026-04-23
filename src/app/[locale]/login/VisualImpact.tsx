'use client';

import React, { memo } from 'react';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Image from '@/components/Image';

export const VisualImpact = memo(() => {
  return (
    <div className="hidden lg:flex w-full lg:w-1/2 h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 z-10 bg-gradient-to-tr from-blue-900 to-transparent" />
      <div className="absolute inset-0 w-full h-full scale-105 animate-pulse-slow pointer-events-none" style={{ animationDuration: '8s' }}>
        <Image
          src="/login-bg.webp"
          alt="Modern Office"
          fill
          priority
          className="object-cover"
        />
      </div>
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
  );
});

VisualImpact.displayName = 'VisualImpact';
