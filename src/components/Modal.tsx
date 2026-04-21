'use client';

import React, { useEffect, useRef } from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  scrollable?: boolean;
  className?: string;
  t?: (key: string) => string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  scrollable = false,
  className = '',
  t = (key) => key
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl sm:max-w-4xl',
    full: 'max-w-full',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 lg:p-8 bg-black/40 backdrop-blur-[6px] animate-fade-in overflow-hidden"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`w-full ${sizeClasses[size]} bg-card text-card-foreground rounded-lg shadow-lg animate-scale-in ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-foreground"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="p-2"
                aria-label={t('common.closeModal')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
        <div className={`p-4 md:p-6 ${scrollable ? 'max-h-[calc(100vh-10rem)] overflow-y-auto modal-scroll-content' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;