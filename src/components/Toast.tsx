'use client';

import React from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Info from 'lucide-react/dist/esm/icons/info';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import { Toast as ToastType, useToastStore } from '@/lib/toastStore';
import { useRouter } from '@/navigation';

const icons = {
    success: <CheckCircle className="w-5 h-5 text-secondary" />,
    error: <AlertCircle className="w-5 h-5 text-destructive" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-primary" />,
};

const borderColors = {
    success: 'border-secondary/50',
    error: 'border-destructive/50',
    warning: 'border-warning/50',
    info: 'border-primary/50',
};

export const Toast: React.FC<{ toast: ToastType }> = ({ toast }) => {
    const { removeToast } = useToastStore();
    const router = useRouter();

    const handleClick = () => {
        if (toast.onClick) {
            toast.onClick();
        } else if (toast.actionPath) {
            router.push(toast.actionPath);
        }
        removeToast(toast.id);
    };

    const isClickable = !!(toast.onClick || toast.actionPath);

    return (
        <div
            onClick={handleClick}
            className={`
                relative group pointer-events-auto flex w-full max-w-md items-start space-x-4 
                rounded-xl border p-4 shadow-lg transition-all duration-300
                glass-card ${borderColors[toast.type]}
                animate-slide-up
                ${isClickable ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]' : ''}
            `}
        >
            <div className="flex-shrink-0 pt-0.5">
                {icons[toast.type]}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground leading-tight">
                    {toast.title}
                </h4>
                {toast.message && (
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {toast.message}
                    </p>
                )}
                {toast.actionLabel && (
                    <p className="mt-2 text-xs font-bold text-primary flex items-center gap-1 group-hover:underline">
                        {toast.actionLabel} →
                    </p>
                )}
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                }}
                className="flex-shrink-0 ml-4 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Progress bar (optional) */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-current opacity-20 transition-all duration-100 ease-linear" style={{ width: '100%' }} />
        </div>
    );
};
