'use client';

import React from 'react';
export function VisualImpact() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <img
        src="/login-bg.webp"
        alt="Modern Office"
        className="absolute inset-0 w-full h-full object-cover scale-105 animate-pulse-slow opacity-60"
        style={{ animationDuration: '8s' }}
      />
    </div>
  );
}
