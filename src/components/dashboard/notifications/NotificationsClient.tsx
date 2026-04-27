'use client';

import { useState, useEffect } from 'react';
import { Button, Alert, Card } from '@/components';
import { EmptyNotifications } from '@/components/EmptyState';
import { useTranslations } from 'next-intl';
import { useNotificationStore } from '@/lib/notificationStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import Eye from 'lucide-react/dist/esm/icons/eye';
import EyeOff from 'lucide-react/dist/esm/icons/eye-off';
import Check from 'lucide-react/dist/esm/icons/check';
import { NotificationItem } from './NotificationItem';

const formatTimeAgo = (dateString: string, t: any) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return t('notifications.justNow');
  if (diffInSeconds < 3600) return t('notifications.minutesAgo', { count: Math.floor(diffInSeconds / 60) });
  if (diffInSeconds < 86400) return t('notifications.hoursAgo', { count: Math.floor(diffInSeconds / 3600) });
  if (diffInSeconds < 604800) return t('notifications.daysAgo', { count: Math.floor(diffInSeconds / 86400) });

  return date.toLocaleDateString();
};

export function NotificationsClient() {
  const t = useTranslations();
  const {
    notifications: storeNotifications,
    fetchNotifications,
    markAsRead: storeMarkAsRead,
    markAllAsRead: storeMarkAllAsRead,
    unreadCount: storeUnreadCount,
    isFetching
  } = useNotificationStore();

  const {
    errors,
    success: successMsg,
    handleError,
    handleSuccess,
    clearErrors,
    setSuccess: setSuccessMsg
  } = useErrorHandler(t);

  const [showRead, setShowRead] = useState(false);
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      clearErrors();
      try {
        const res = await fetchNotifications();
        if (res && !res.ok) {
          const errorData = await res.json().catch(() => ({}));
          handleError(errorData, t('apiErrors.fetchNotificationsFailed'));
        }
      } catch (err) {
        handleError(err, t('apiErrors.fetchNotificationsFailed'));
      }
    };
    loadData();
  }, [fetchNotifications, t, handleError, clearErrors]);

  const handleMarkAsRead = async (id: string) => {
    setLoadingActions(prev => new Set(prev).add(id));
    try {
      const res = await storeMarkAsRead(id);
      if (res && !res.ok) {
        const errorData = await res.json().catch(() => ({}));
        handleError(errorData, t('apiErrors.markReadFailed'));
      }
    } catch (err) {
      handleError(err, t('apiErrors.markReadFailed'));
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await storeMarkAllAsRead();
      if (res && res.ok) {
        handleSuccess(t('notifications.allNotificationsMarkedAsRead'));
      } else if (res) {
        const errorData = await res.json().catch(() => ({}));
        handleError(errorData, t('apiErrors.markAllReadFailed'));
      }
    } catch (err) {
      handleError(err, t('apiErrors.markAllReadFailed'));
    }
  };

  const displayNotifications = showRead
    ? storeNotifications
    : storeNotifications.filter(n => !n.isRead);

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap gap-4 md:gap-6 lg:gap-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-none pb-1">
            {t('common.notifications')}
          </h1>
          <p className="text-muted-foreground leading-none pb-1">
            {t('notifications.stayUpdated')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          <Button
            variant={showRead ? "secondary" : "outline2"}
            onClick={() => setShowRead(!showRead)}
            className="gap-2"
          >
            {showRead ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showRead ? t('notifications.showingAll') : t('notifications.unreadOnly')}
          </Button>
          {storeUnreadCount > 0 && (
            <Button
              variant="secondary"
              onClick={markAllAsRead}
              className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Check className="w-4 h-4" />
              {t('notifications.markAllAsRead')}
            </Button>
          )}
        </div>
      </div>

      {errors.general && <Alert type="error" message={errors.general} onClose={() => clearErrors()} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      <Card className="rounded-2xl shadow-xl overflow-hidden" padding="none">
        <div className="p-4 md:p-6 lg:p-8 border-b border-border">
          <h2 className="text-2xl font-bold text-card-foreground">
            {t('notifications.yourNotifications')}
          </h2>
          <p className="text-muted-foreground mt-2">
            {storeUnreadCount > 0 ? `${storeUnreadCount} ${storeUnreadCount > 1 ? t('notifications.unreadNotifications') : t('notifications.unreadNotification')}` : t('notifications.allCaughtUp')}
          </p>
        </div>
        <div className="p-4 md:p-6 lg:p-8">
          {displayNotifications.length > 0 ? (
            <div className="space-y-4 md:space-y-6 lg:space-y-8">
              {displayNotifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  loading={loadingActions.has(notification._id)}
                  formatTimeAgo={formatTimeAgo}
                  t={t}
                />
              ))}
            </div>
          ) : !isFetching.list && (
            <div className="py-12 flex flex-col items-center">
              <EmptyNotifications variant="secondary" />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
