'use client';

import React, { useState, useEffect, useRef } from 'react';
import Bell from 'lucide-react/dist/esm/icons/bell';
import Clock from 'lucide-react/dist/esm/icons/clock';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import IndianRupee from 'lucide-react/dist/esm/icons/indian-rupee';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import { useNotificationStore, Notification } from '@/lib/notificationStore';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';

interface NotificationBellProps {
    variant?: 'primary' | 'secondary';
}

export const NotificationBell: React.FC<NotificationBellProps> = React.memo(({ variant = 'primary' }) => {
    const t = useTranslations();
    const router = useRouter();
    const { unreadCount, fetchUnreadCount, markAsRead, notifications: storeNotifications, fetchNotifications, isFetching } = useNotificationStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const accentColor = variant === 'primary' ? 'text-primary' : 'text-secondary';
    const accentBg = variant === 'primary' ? 'bg-primary' : 'bg-secondary';
    const accentBgLight = variant === 'primary' ? 'bg-primary/10' : 'bg-secondary/10';
    const accentBorder = variant === 'primary' ? 'border-primary' : 'border-secondary';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        // Initial fetch of unread count
        fetchUnreadCount();

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [fetchUnreadCount]);

    const handleToggle = () => {
        if (!isOpen) {
            fetchNotifications(true); // Force fetch latest when opening
        }
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = async (notif: Notification) => {
        if (!notif.isRead) {
            await markAsRead(notif._id);
        }
        setIsOpen(false);

        let path = '/dashboard/notifications';
        if (notif.type === 'task_assigned' || notif.type === 'task_due') {
            path = '/user/tasks';
        } else if (notif.type === 'salary_generated') {
            path = '/user/salary';
        } else if (notif.type === 'late_arrival') {
            path = '/dashboard/attendance';
        }
        router.push(path);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'task_assigned': return <CheckCircle className="w-4 h-4 text-primary" />;
            case 'task_due': return <Clock className="w-4 h-4 text-warning" />;
            case 'salary_generated': return <IndianRupee className="w-4 h-4 text-secondary" />;
            case 'late_arrival': return <AlertTriangle className="w-4 h-4 text-destructive" />;
            default: return <Bell className={`w-4 h-4 ${accentColor}`} />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="relative p-2 h-9 w-9 flex items-center justify-center rounded-lg bg-background border border-border text-foreground hover:bg-muted transition-all duration-300"
                aria-label="Notifications"
            >
                <Bell className={`w-5 h-5 shrink-0 ${unreadCount > 0 ? `animate-bounce-slow ${accentColor} font-bold` : 'text-muted-foreground'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full mt-2 sm:w-96 max-w-sm rounded-2xl overflow-hidden bg-card/95 backdrop-blur-xl border border-border/60 shadow-2xl z-50 animate-scale-in ring-1 ring-black/5">
                    <div className="p-4 border-b border-border/60 bg-muted/30 flex justify-between items-center">
                        <h3 className="font-bold text-foreground">{t('notifications.yourNotifications')}</h3>
                        <span className={`text-xs ${accentBgLight} ${accentColor} px-2 py-0.5 rounded-full font-medium`}>
                            {unreadCount} {t('notifications.unread')}
                        </span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        {isFetching.list ? (
                            <div className="p-8 flex justify-center">
                                <div className={`w-6 h-6 border-2 ${accentBorder} border-t-transparent rounded-full animate-spin`}></div>
                            </div>
                        ) : storeNotifications.length > 0 ? (
                            <div className="divide-y divide-border/40">
                                {storeNotifications.slice(0, 5).map((notif) => {
                                    const typeColors = {
                                        task_assigned: 'bg-primary/10 text-primary',
                                        task_due: 'bg-warning/10 text-warning',
                                        salary_generated: 'bg-secondary/10 text-secondary',
                                        late_arrival: 'bg-destructive/10 text-destructive',
                                        default: `${accentBgLight} ${accentColor}`
                                    };
                                    const colors = (typeColors as any)[notif.type] || typeColors.default;

                                    return (
                                        <div
                                            key={notif._id}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`p-4 flex gap-4 cursor-pointer transition-all duration-200 ${notif.isRead ? 'opacity-60 hover:bg-muted/50' : `${variant === 'primary' ? 'bg-primary/[0.05]' : 'bg-secondary/[0.05]'} hover:${variant === 'primary' ? 'bg-primary/[0.08]' : 'bg-secondary/[0.08]'}`}`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colors}`}>
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm leading-tight mb-1 ${notif.isRead ? 'text-foreground/80' : 'text-foreground font-semibold'}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {notif.message}
                                                </p>
                                            </div>
                                            {!notif.isRead && (
                                                <div className={`w-2 h-2 rounded-full ${accentBg} mt-2 shrink-0 shadow-sm shadow-black/20`}></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                                <p className="text-sm text-muted-foreground">{t('notifications.allCaughtUp')}</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-muted/30 border-t border-border/60 text-center">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                router.push('/dashboard/notifications');
                            }}
                            className={`text-xs font-bold ${accentColor} hover:underline transition-all`}
                        >
                            {t('notifications.viewAll')} →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

NotificationBell.displayName = 'NotificationBell';
