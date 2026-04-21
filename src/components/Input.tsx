'use client';

import React, { forwardRef, useId } from 'react';
import type { LucideIcon } from 'lucide-react';
import Eye from 'lucide-react/dist/esm/icons/eye';
import EyeOff from 'lucide-react/dist/esm/icons/eye-off';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  ringVariant?: 'primary' | 'secondary' | 'warning' | 'destructive';
}

const Input = React.memo(forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = true,
  variant = 'default',
  ringVariant = 'primary',
  className = '',
  id,
  type,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const reactId = useId();
  const inputId = id || reactId;

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const baseClasses = 'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50';

  const variantClasses = {
    default: '',
    filled: 'bg-secondary border-0',
    outlined: 'bg-transparent',
  };

  const ringClasses = {
    primary: 'focus-visible:ring-ring',
    secondary: 'focus-visible:ring-secondary',
    warning: 'focus-visible:ring-warning',
    destructive: 'focus-visible:ring-destructive',
  };

  const iconClasses = 'absolute top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5';
  const iconLeftClasses = `${iconClasses} left-3`;
  const iconRightClasses = `${iconClasses} right-3`;

  const inputPaddingLeft = Icon && iconPosition === 'left' ? 'pl-10' : '';
  let inputPaddingRight = Icon && iconPosition === 'right' ? 'pr-10' : '';
  if (isPassword) {
    inputPaddingRight = 'pr-10';
  }

  const focusRingClass = ringClasses[ringVariant];
  const inputClasses = `${baseClasses} ${focusRingClass} ${variantClasses[variant]} ${inputPaddingLeft} ${inputPaddingRight} ${fullWidth ? 'w-full' : ''} ${className}`;

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Performance optimization: only scroll if error is new and non-empty
  const lastErrorRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (error && error !== lastErrorRef.current && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    lastErrorRef.current = error;
  }, [error]);

  return (
    <div ref={containerRef} className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground mb-1.5 cursor-pointer select-none"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <Icon className={iconLeftClasses} aria-hidden="true" />
        )}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {Icon && iconPosition === 'right' && !isPassword && (
          <Icon className={iconRightClasses} aria-hidden="true" />
        )}
        {isPassword && (
          <button
            type="button"
            onClick={handleTogglePassword}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-transparent border-0 cursor-pointer focus:outline-none text-muted-foreground hover:text-foreground transition-all rounded-md"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Eye className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          id={`${inputId}-helper`}
          className="mt-1 text-sm text-muted-foreground"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}));

Input.displayName = 'Input';

export default Input;