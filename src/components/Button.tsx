'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'outline2';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  'aria-label'?: string;
}

const Button: React.FC<ButtonProps> = React.memo(({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  disabled,
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseClasses = 'inline-flex flex-row items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap';

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
    outline: 'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground',
    outline2: 'border border-input bg-transparent shadow-sm hover:bg-secondary hover:text-accent-foreground',
    danger: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-10 px-8 text-base gap-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Combine classes: base + variant + size + custom
  const finalClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const isDisabled = disabled || loading;

  return (
    <button
      className={finalClasses}
      disabled={isDisabled}
      aria-label={ariaLabel}
      {...props}
    >
      {loading && <Spinner size="sm" className="text-current" />}
      {!loading && Icon && iconPosition === 'left' && <Icon className={`${iconSizes[size]} shrink-0`} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className={`${iconSizes[size]} shrink-0`} />}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;