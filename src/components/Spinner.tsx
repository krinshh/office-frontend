'use client';

import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'white';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', variant = 'primary', className = '' }) => {
  const dimensions = {
    sm: { wrapper: 'w-6 h-6',   hole: 'w-3.5 h-3.5'  },
    md: { wrapper: 'w-10 h-10', hole: 'w-6 h-6'       },
    lg: { wrapper: 'w-16 h-16', hole: 'w-10 h-10'     },
  };

  const gradients = {
    primary:   'from-primary via-primary/50 to-transparent',
    secondary: 'from-secondary via-secondary/50 to-transparent',
    white:     'from-white via-white/50 to-transparent',
  };

  const d = dimensions[size];

  return (
    <div className={`relative flex items-center justify-center ${d.wrapper} ${className}`}>
      {/* Spinning gradient ring */}
      <div
        className="absolute inset-0 rounded-full animate-spin"
        style={{
          background: `conic-gradient(from 0deg, transparent 0%, transparent 40%, hsl(var(--primary)) 100%)`,
          animationDuration: '700ms',
          animationTimingFunction: 'linear',
        }}
      />
      {/* Inner mask to create ring shape */}
      <div className={`${d.hole} rounded-full bg-card z-10`} />
    </div>
  );
};

export default Spinner;
