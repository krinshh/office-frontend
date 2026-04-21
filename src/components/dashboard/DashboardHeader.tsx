'use client';

import { useAuthStore } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { DashboardHeaderSkeleton } from './DashboardSkeleton';

export default function DashboardHeader() {
  const { user } = useAuthStore();
  const t = useTranslations();
  const { hasAnyPermission } = usePermissions();

  if (!user) return <DashboardHeaderSkeleton />;

  const isManagement = hasAnyPermission([
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.OFFICES_MANAGE,
    PERMISSIONS.ATTENDANCE_VIEW_ALL,
    PERMISSIONS.TASKS_VIEW_ALL,
    PERMISSIONS.SALARY_VIEW_ALL,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.AUDIT_LOGS_VIEW,
    PERMISSIONS.GLOBAL_CONFIG_MANAGE
  ]);

  const accentColor = isManagement ? 'text-primary' : 'text-secondary';
  const bgColor = isManagement ? 'bg-primary/5' : 'bg-secondary/5';

  const userTypeName = typeof user.userType === 'object' ? (user.userType as any)?.name : user.userType;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboardHome.greetings.morning');
    if (hour < 18) return t('dashboardHome.greetings.afternoon');
    return t('dashboardHome.greetings.evening');
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-card border border-border shadow-sm p-4 md:p-6 lg:p-8 pl-5 md:pl-7">
      <div className="relative z-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground tracking-tight transition-colors duration-300">
          {getGreeting()}, <span className={`${accentColor} transition-colors duration-300`}>{user.name.split(' ')[0]}</span>
        </h1>
        <p className="text-muted-foreground text-base max-w-2xl">
          {t.rich('dashboardHome.loggedInAs', {
            role: userTypeName,
            span: (chunks) => <span className="font-medium text-secondary">{chunks}</span>
          })}
        </p>
      </div>
    </div>
  );
}
