'use client';

import Clock from 'lucide-react/dist/esm/icons/clock';
import Check from 'lucide-react/dist/esm/icons/check';
import CheckSquare from 'lucide-react/dist/esm/icons/check-square';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import IndianRupee from 'lucide-react/dist/esm/icons/indian-rupee';
import Bell from 'lucide-react/dist/esm/icons/bell';
import { useRouter } from 'next/navigation';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  loading: boolean;
  formatTimeAgo: (dateString: string, t: any) => string;
  t: any;
}

const NotificationPriority = ({ type, t }: { type: string; t: any }) => {
  const getPriorityInfo = (type: string) => {
    switch (type) {
      case 'late_arrival':
        return {
          level: t('notifications.high'),
          className: 'bg-destructive/10 text-destructive border-destructive/20'
        };
      case 'task_due':
        return {
          level: t('notifications.medium'),
          className: 'bg-warning/10 text-warning border-warning/20'
        };
      case 'task_assigned':
      case 'salary_generated':
        return {
          level: t('notifications.normal'),
          className: 'bg-secondary/10 text-secondary border-secondary/20'
        };
      default:
        return {
          level: t('notifications.normal'),
          className: 'bg-muted text-muted-foreground border-border'
        };
    }
  };

  // const { level, className } = getPriorityInfo(type);

  // return (
  //   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${className}`}>
  //     {level}
  //   </span>
  // );
};

export function NotificationItem({ notification, onMarkAsRead, loading, formatTimeAgo, t }: NotificationItemProps) {
  const router = useRouter();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return <CheckSquare className="w-6 h-6" />;
      case 'task_due':
        return <Clock className="w-6 h-6" />;
      case 'late_arrival':
        return <AlertTriangle className="w-6 h-6" />;
      case 'salary_generated':
        return <IndianRupee className="w-6 h-6" />;
      default:
        return <Bell className="w-6 h-6" />;
    }
  };

  const getNotificationStyles = (isRead: boolean) => {
    return `relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 group ${isRead
      ? 'bg-card border-border/60 opacity-80'
      : 'bg-card border-border shadow-md ring-1 ring-primary/5 cursor-pointer'
      } hover:shadow-lg hover:border-primary/30 active:scale-[0.99]`;
  };

  const getAccentBarColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-muted-foreground/20';
    switch (type) {
      case 'task_assigned': return 'bg-primary/90';
      case 'task_due': return 'bg-warning/90';
      case 'late_arrival': return 'bg-destructive/90';
      case 'salary_generated': return 'bg-secondary/90';
      default: return 'bg-primary';
    }
  };

  const getIconContainerStyles = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return 'bg-primary/10 text-primary';
      case 'task_due':
        return 'bg-warning/10 text-warning';
      case 'late_arrival':
        return 'bg-destructive/10 text-destructive';
      case 'salary_generated':
        return 'bg-secondary/10 text-secondary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getNotificationTypeLabel = (type: string, t: any) => {
    switch (type) {
      case 'task_assigned':
        return t('notifications.taskAssigned');
      case 'task_due':
        return t('notifications.taskDue');
      case 'late_arrival':
        return t('notifications.lateArrival');
      case 'salary_generated':
        return t('notifications.salaryGenerated');
      default:
        return t('notifications.notification');
    }
  };

  const handleNavigate = () => {
    switch (notification.type) {
      case 'task_assigned':
      case 'task_due':
        router.push('/user/tasks');
        break;
      case 'late_arrival':
        router.push('/dashboard/attendance');
        break;
      case 'salary_generated':
        router.push('/user/salary');
        break;
      default:
        break;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If it's unread, mark as read AND navigate
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
    // Always navigate on card click
    handleNavigate();
  };

  const handleMarkAsReadOnly = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card's handleCardClick (navigation)
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={getNotificationStyles(notification.isRead)}
      role="article"
      aria-label={`Notification: ${notification.title}`}
      tabIndex={notification.isRead ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e as any);
        }
      }}
    >
      {/* Vertical Accent Bar */}
      <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full transition-all duration-300 ${getAccentBarColor(notification.type, notification.isRead)}`} />

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getIconContainerStyles(notification.type)}`}>
              {getNotificationIcon(notification.type)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="space-y-1.5">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className={`text-base sm:text-lg font-bold leading-tight truncate ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {notification.title}
                  </h3>
                  {!notification.isRead && (
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* <NotificationPriority type={notification.type} t={t} /> */}
                <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 px-2 py-0.5 rounded-md border border-border/40">
                  {getNotificationTypeLabel(notification.type, t)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground font-medium whitespace-nowrap bg-muted/30 px-2 py-1 rounded-lg border border-border/40 self-start sm:mt-0.5">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(notification.createdAt, t)}
            {loading && (
              <div className="ml-1 w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </div>

        <p className={`text-sm leading-relaxed ${notification.isRead ? 'text-muted-foreground line-clamp-1' : 'text-foreground line-clamp-2 sm:line-clamp-none'}`}>
          {notification.message}
        </p>

        {!notification.isRead && (
          <div className="mt-2 flex items-center justify-end">
            <div
              onClick={handleMarkAsReadOnly}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary/80 hover:text-primary transition-colors cursor-pointer"
            >
              <span>{t('notifications.clickToMarkAsRead')}</span>
              <Check className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
