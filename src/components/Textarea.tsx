'use client';

import React, { forwardRef, useId } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  ringVariant?: 'primary' | 'secondary' | 'warning' | 'destructive';
}

const Textarea = React.memo(forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  fullWidth = true,
  resize = 'vertical',
  ringVariant = 'primary',
  className = '',
  id,
  ...props
}, ref) => {
  const reactId = useId();
  const textareaId = id || reactId;

  const baseClasses = 'flex min-h-[60px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors';

  const ringClasses = {
    primary: 'focus-visible:ring-ring',
    secondary: 'focus-visible:ring-secondary',
    warning: 'focus-visible:ring-warning',
    destructive: 'focus-visible:ring-destructive',
  };

  const variantClasses = error
    ? `border-destructive ${ringClasses.destructive}`
    : `border-input ${ringClasses[ringVariant]}`;

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  const textareaClasses = `${baseClasses} ${variantClasses} ${resizeClasses[resize]} ${fullWidth ? 'w-full' : ''} ${className}`.trim();

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={textareaClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${textareaId}-error`}
          className="mt-1 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          id={`${textareaId}-helper`}
          className="mt-1 text-sm text-muted-foreground"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}));

Textarea.displayName = 'Textarea';

export default Textarea;