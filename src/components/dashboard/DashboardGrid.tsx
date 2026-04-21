'use client';

import React from 'react';

import Link from '@/components/Link';
import Card from '@/components/Card';
import { useAuthStore } from '@/lib/store';
import { useTranslations } from 'next-intl';
import Users from 'lucide-react/dist/esm/icons/users';
import CheckSquare from 'lucide-react/dist/esm/icons/check-square';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import IndianRupee from 'lucide-react/dist/esm/icons/indian-rupee';
import Building from 'lucide-react/dist/esm/icons/building';
import Settings from 'lucide-react/dist/esm/icons/settings';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import Bell from 'lucide-react/dist/esm/icons/bell';
import Shield from 'lucide-react/dist/esm/icons/shield';
import User from 'lucide-react/dist/esm/icons/user';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { DashboardGridSkeleton } from './DashboardSkeleton';

interface DashboardCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  index: number;
  viewDetailsText: string;
}

function DashboardCard({ href, icon, title, description, color, index, viewDetailsText }: DashboardCardProps) {
  // Static map to ensure Tailwind scanner sees the full class names
  // This prevents classes from being purged in production build.
  const colorMap: Record<string, { bg: string; hoverBg: string }> = {
    'text-primary': {
      bg: 'bg-primary',
      hoverBg: 'group-hover:bg-primary'
    },
    'text-secondary': {
      bg: 'bg-secondary',
      hoverBg: 'group-hover:bg-secondary'
    }
  };

  const activeColor = colorMap[color] || { bg: 'bg-primary', hoverBg: 'group-hover:bg-primary' };

  return (
    <Link
      href={href}
      className="block h-full"
      style={{
        animation: `slide-up 0.4s ease-out forwards`,
        animationDelay: `${index * 0.05}s`,
        opacity: 0,
      }}
      prefetch={false}
    >
      <Card
        className="group relative overflow-hidden transition-all duration-200 cursor-pointer h-full border border-border bg-card shadow-sm hover:shadow-md"
        padding="none"
      >
        <div className={`absolute top-0 left-0 w-1 h-full transition-opacity duration-200 ${activeColor.bg}`} />
        <div className="flex flex-col items-start p-4 md:p-6 pl-5 md:pl-7 h-full">
          <div className="flex items-center justify-between w-full mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-background ${color} border border-border transition-colors duration-200 ${activeColor.hoverBg} group-hover:text-background`}>
              {icon}
            </div>
            <span className="text-xs font-medium text-muted-foreground opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
              {viewDetailsText}
            </span>
          </div>
          <h3
            className="text-base font-semibold mb-2 transition-colors">
            <span className={color}>{title}</span>
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 transition-colors">
            <span>{description}</span>
          </p>
        </div>
      </Card>
    </Link>
  );
}

export default function DashboardGrid() {
  const { user } = useAuthStore();
  const t = useTranslations();
  const { hasPermission } = usePermissions();

  if (!user) return <DashboardGridSkeleton />; 

  const managementCards = [];
  const accountCards = [];

  if (hasPermission(PERMISSIONS.USERS_VIEW)) {
    managementCards.push({
      href: '/dashboard/users',
      icon: <Users className="w-6 h-6" />,
      title: t('dashboardHome.cards.userManagement.title'),
      description: t('dashboardHome.cards.userManagement.description'),
      color: 'text-primary',
    });
  }

  if (hasPermission(PERMISSIONS.OFFICES_MANAGE)) {
    managementCards.push({
      href: '/dashboard/offices',
      icon: <Building className="w-6 h-6" />,
      title: t('dashboardHome.cards.officeLocations.title'),
      description: t('dashboardHome.cards.officeLocations.description'),
      color: 'text-primary',
    });
  }

  if (hasPermission(PERMISSIONS.ATTENDANCE_VIEW_ALL)) {
    managementCards.push({
      href: '/dashboard/attendance',
      icon: <Calendar className="w-6 h-6" />,
      title: t('dashboardHome.cards.attendanceReports.title'),
      description: t('dashboardHome.cards.attendanceReports.description'),
      color: 'text-primary',
    });
  }

  if (hasPermission(PERMISSIONS.TASKS_VIEW_ALL)) {
    managementCards.push({
      href: '/dashboard/tasks',
      icon: <CheckSquare className="w-6 h-6" />,
      title: t('dashboardHome.cards.taskManagement.title'),
      description: t('dashboardHome.cards.taskManagement.description'),
      color: 'text-primary',
    });
  }

  if (hasPermission(PERMISSIONS.SALARY_VIEW_ALL)) {
    managementCards.push({
      href: '/dashboard/salary',
      icon: <IndianRupee className="w-6 h-6" />,
      title: t('dashboardHome.cards.salaryManagement.title'),
      description: t('dashboardHome.cards.salaryManagement.description'),
      color: 'text-primary',
    });
  }

  if (hasPermission(PERMISSIONS.REPORTS_VIEW)) {
    managementCards.push({
      href: '/dashboard/reports',
      icon: <BarChart3 className="w-6 h-6" />,
      title: t('dashboardHome.cards.reportsAnalytics.title'),
      description: t('dashboardHome.cards.reportsAnalytics.description'),
      color: 'text-primary',
    });
  }

  if (hasPermission(PERMISSIONS.AUDIT_LOGS_VIEW)) {
    managementCards.push({
      href: '/dashboard/audit',
      icon: <Shield className="w-6 h-6" />,
      title: t('dashboardHome.cards.auditLogs.title'),
      description: t('dashboardHome.cards.auditLogs.description'),
      color: 'text-primary',
    });
  }

  if (hasPermission(PERMISSIONS.GLOBAL_CONFIG_MANAGE)) {
    managementCards.push({
      href: '/dashboard/global-config',
      icon: <Settings className="w-6 h-6" />,
      title: t('dashboardHome.cards.globalConfig.title'),
      description: t('dashboardHome.cards.globalConfig.description'),
      color: 'text-primary',
    });
  }

  accountCards.push({
    href: '/user/attendance',
    icon: <Calendar className="w-6 h-6" />,
    title: t('dashboardHome.cards.myAttendance.title'),
    description: t('dashboardHome.cards.myAttendance.description'),
    color: 'text-secondary',
  }, {
    href: '/user/profile',
    icon: <User className="w-6 h-6" />,
    title: t('dashboardHome.cards.myProfile.title'),
    description: t('dashboardHome.cards.myProfile.description'),
    color: 'text-secondary',
  }, {
    href: '/user/tasks',
    icon: <CheckSquare className="w-6 h-6" />,
    title: t('dashboardHome.cards.myTasks.title'),
    description: t('dashboardHome.cards.myTasks.description'),
    color: 'text-secondary',
  }, {
    href: '/user/salary',
    icon: <IndianRupee className="w-6 h-6" />,
    title: t('dashboardHome.cards.salarySummary.title'),
    description: t('dashboardHome.cards.salarySummary.description'),
    color: 'text-secondary',
  }, {
    href: '/dashboard/notifications',
    icon: <Bell className="w-6 h-6" />,
    title: t('dashboardHome.cards.notifications.title'),
    description: t('dashboardHome.cards.notifications.description'),
    color: 'text-secondary',
  });

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in w-full">
      {managementCards.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-4 md:mb-6 lg:mb-8">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              {t('sidebar.generalSection')}
            </h2>
            <div className="h-px flex-1 bg-border/60" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {managementCards.map((card, index) => (
              <DashboardCard
                key={card.href}
                {...card}
                index={index}
                viewDetailsText={t('common.viewDetails')}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-4 mb-4 md:mb-6 lg:mb-8">
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {t('sidebar.myAccountSection')}
          </h2>
          <div className="h-px flex-1 bg-border/60" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {accountCards.map((card, index) => (
            <DashboardCard
              key={card.href}
              {...card}
              index={managementCards.length + index}
              viewDetailsText={t('common.viewDetails')}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
