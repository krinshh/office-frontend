'use client';

import React, { useEffect } from 'react';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import Info from 'lucide-react/dist/esm/icons/info';
import X from 'lucide-react/dist/esm/icons/x';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
  autoDismiss?: boolean;
  duration?: number;
  position?: 'top' | 'bottom' | 'inline';
  t?: (key: string) => string;
}

const Alert: React.FC<AlertProps> = ({
  type = 'info',
  message,
  onClose,
  className = '',
  autoDismiss = type === 'success',
  duration = 5000,
  position = 'inline',
  t = (key) => key
}) => {
  const styles = {
    success: {
      wrapper: 'bg-secondary/20 border-secondary/40',
      icon: 'text-secondary',
      text: 'text-foreground',
      accent: 'bg-secondary',
      close: 'hover:bg-secondary/20',
    },
    error: {
      wrapper: 'bg-destructive/10 border-destructive/40',
      icon: 'text-destructive',
      text: 'text-destructive',
      accent: 'bg-destructive',
      close: 'hover:bg-destructive/20',
    },
    warning: {
      wrapper: 'bg-warning/10 border-warning/40',
      icon: 'text-warning',
      text: 'text-warning',
      accent: 'bg-warning',
      close: 'hover:bg-warning/20',
    },
    info: {
      wrapper: 'bg-primary/10 border-primary/40',
      icon: 'text-primary',
      text: 'text-primary',
      accent: 'bg-primary',
      close: 'hover:bg-primary/20',
    },
  };

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const positionClasses = {
    top: 'fixed top-4 left-4 right-4 z-50 max-w-md mx-auto',
    bottom: 'fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto',
    inline: '',
  };

  const Icon = icons[type];
  const s = styles[type];
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [message]);

  useEffect(() => {
    if (autoDismiss && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, duration, onClose]);

  return (
    <div
      ref={scrollRef}
      className={`relative flex items-start gap-3 rounded-lg border px-4 py-3 shadow-sm animate-slide-up overflow-hidden ${s.wrapper} ${positionClasses[position]} ${className}`}
    >
      {/* Left accent bar */}
      <span className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${s.accent}`} aria-hidden="true" />

      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${s.icon}`} />

      <p className={`flex-1 text-sm font-medium leading-relaxed ${s.text}`}>
        {message}
      </p>

      {onClose && (
        <button
          onClick={onClose}
          aria-label={t('common.closeAlert')}
          className={`flex-shrink-0 rounded-md p-1 transition-colors text-current opacity-60 hover:opacity-100 ${s.close}`}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default Alert;
