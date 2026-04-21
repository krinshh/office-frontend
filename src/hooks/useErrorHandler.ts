'use client';

import { useState, useCallback, useEffect } from 'react';
import { analyzeError } from '@/lib/errorHandler';

export const useErrorHandler = (t: any) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string>('');
  const [loading, setIsLoading] = useState<boolean>(false);

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-clear error messages after 10 seconds
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setErrors({});
      }, 10000); // 10 seconds (double the success time)
      return () => clearTimeout(timer);
    }
  }, [errors]);

  const handleError = useCallback((error: any, fallbackMessage?: string) => {
    setSuccess('');

    // Check if error is a simple object with type: 'validation'
    if (error && error.type === 'validation' && error.field && error.message) {
      setErrors(prev => ({ ...prev, [error.field]: error.message }));
      return;
    }

    // If it's a structured validation error from backend (details array)
    if (error && error.details && Array.isArray(error.details)) {
      const newErrors: Record<string, string> = {};
      error.details.forEach((detail: any) => {
        newErrors[detail.path || detail.field] = detail.message;
      });
      setErrors(prev => ({ ...prev, ...newErrors }));

      // Auto-scroll to first error
      setTimeout(() => {
        const firstErrorKey = Object.keys(newErrors)[0];
        const element = document.getElementsByName(firstErrorKey)[0] || document.getElementById(firstErrorKey);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }, 100);
      return;
    }

    // General error analysis
    const analyzedMessage = analyzeError(error, t);
    setErrors({ general: analyzedMessage || fallbackMessage || t('apiErrors.unexpected') });

    // Auto-scroll to top for general error
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [t]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setSuccess('');
  }, []);

  const handleSuccess = useCallback((message: string) => {
    setErrors({});
    setSuccess(message);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    errors: errors,
    success: success,
    loading: loading,
    setLoading: setIsLoading,
    setIsLoading,
    handleError: handleError,
    handleSuccess: handleSuccess,
    clearErrors: clearErrors,
    setErrors: setErrors,
    setSuccess: setSuccess
  };
};
