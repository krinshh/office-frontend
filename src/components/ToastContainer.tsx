'use client';

import React from 'react';
import { useToastStore } from '@/lib/toastStore';
import { Toast } from './Toast';

export const ToastContainer: React.FC = () => {
    const { toasts } = useToastStore();

    return (
        <div
            aria-live="assertive"
            className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6"
        >
            <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} />
                ))}
            </div>
        </div>
    );
};
