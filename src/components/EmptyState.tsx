import React from 'react';
import Button from './Button';
import { useTranslations } from 'next-intl';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'outline' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actions?: EmptyStateAction[];
  illustration?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: string;
  variant?: 'primary' | 'secondary' | 'warning' | 'danger';
}

const getVariantColors = (variant: 'primary' | 'secondary' | 'warning' | 'danger') => {
  const colors = {
    primary: {
      bgLight: 'bg-primary/10',
      text: 'text-primary',
      bg: 'bg-primary',
      textFg: 'text-primary-foreground'
    },
    secondary: {
      bgLight: 'bg-secondary',
      text: 'text-secondary-foreground',
      bg: 'bg-secondary-foreground/20',
      textFg: 'text-secondary-foreground'
    },
    warning: {
      bgLight: 'bg-warning/10',
      text: 'text-warning',
      bg: 'bg-warning',
      textFg: 'text-warning-foreground'
    },
    danger: {
      bgLight: 'bg-destructive/10',
      text: 'text-destructive',
      bg: 'bg-destructive',
      textFg: 'text-destructive-foreground'
    }
  };
  return colors[variant] || colors.primary;
};

const getDefaultIllustration = (type: string, variant: 'primary' | 'secondary' | 'warning' | 'danger') => {
  const colors = getVariantColors(variant);

  const illustrations: Record<string, React.ReactNode> = {
    users: (
      <div className="relative">
        <div className={`w-20 h-20 ${colors.bgLight} rounded-2xl flex items-center justify-center shadow-sm`}>
          <svg className={`w-10 h-10 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <div className={`absolute -top-2 -right-2 w-8 h-8 ${colors.bg} rounded-full flex items-center justify-center shadow-md border-2 border-background`}>
          <span className={`${colors.textFg} font-bold text-sm`}>+</span>
        </div>
      </div>
    ),
    offices: (
      <div className="relative">
        <div className={`w-20 h-20 ${colors.bgLight} rounded-2xl flex items-center justify-center shadow-sm`}>
          <svg className={`w-10 h-10 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center shadow-md border-2 border-background`}>
          <svg className={`w-3 h-3 ${colors.textFg}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    ),
    tasks: (
      <div className="relative">
        <div className={`w-20 h-20 ${colors.bgLight} rounded-2xl flex items-center justify-center shadow-sm`}>
          <svg className={`w-10 h-10 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div className={`absolute -top-1 -left-1 w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center shadow-md animate-pulse border-2 border-background`}>
          <span className={`${colors.textFg} font-bold text-xs`}>✓</span>
        </div>
      </div>
    ),
    notifications: (
      <div className="relative">
        <div className={`w-20 h-20 ${colors.bgLight} rounded-2xl flex items-center justify-center shadow-sm`}>
          <svg className={`w-10 h-10 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V7h-5v5l5 5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
        </div>
        <div className={`absolute -top-1 -right-1 w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center shadow-md border-2 border-background`}>
          <span className={`${colors.textFg} font-bold text-xs`}>0</span>
        </div>
      </div>
    ),
    attendance: (
      <div className="relative">
        <div className={`w-20 h-20 ${colors.bgLight} rounded-2xl flex items-center justify-center shadow-sm`}>
          <svg className={`w-10 h-10 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center shadow-md border-2 border-background`}>
          <svg className={`w-3 h-3 ${colors.textFg}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    ),
    salary: (
      <div className="relative">
        <div className={`w-20 h-20 ${colors.bgLight} rounded-2xl flex items-center justify-center shadow-sm`}>
          <svg className={`w-10 h-10 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <div className={`absolute -top-1 -left-1 w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center shadow-md border-2 border-background`}>
          <span className={`${colors.textFg} font-bold text-xs`}>$</span>
        </div>
      </div>
    ),
    reports: (
      <div className="relative">
        <div className={`w-20 h-20 ${colors.bgLight} rounded-2xl flex items-center justify-center shadow-sm`}>
          <svg className={`w-10 h-10 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center shadow-md border-2 border-background`}>
          <svg className={`w-3 h-3 ${colors.textFg}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        </div>
      </div>
    ),
    audit: (
      <div className="relative">
        <div className={`w-20 h-20 ${colors.bgLight} rounded-2xl flex items-center justify-center shadow-sm`}>
          <svg className={`w-10 h-10 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div className={`absolute -top-1 -right-1 w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center shadow-md border-2 border-background`}>
          <svg className={`w-3 h-3 ${colors.textFg}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    ),
  };

  return illustrations[type] || null;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actions = [],
  illustration,
  size = 'md',
  className = '',
  type,
  variant = 'primary'
}) => {
  const t = useTranslations();

  // Use translations if type is provided, otherwise use provided props
  const finalTitle = type ? t(`emptyStates.${type}.title`) : title;
  const finalDescription = type ? t(`emptyStates.${type}.description`) : description;
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
  };

  return (
    <div className={`text-center ${sizeClasses[size]} ${className} max-w-2xl mx-auto animate-fade-in`}>
      {/* Illustration */}
      <div className="mb-6 flex justify-center">
        {illustration || (type ? getDefaultIllustration(type, variant) : icon)}
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto">
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 text-center">
          {finalTitle}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 text-center">
          {finalDescription}
        </p>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || (variant === 'danger' ? 'danger' : variant as any) || 'primary'}
                className="flex items-center justify-center gap-2 w-auto min-w-[140px]"
              >
                <span className="flex-shrink-0">
                  {action.icon}
                </span>
                <span className="truncate">
                  {action.label}
                </span>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};// Pre-configured empty states for common use cases
export const EmptyUsers: React.FC<{ onAddUser: () => void; variant?: 'primary' | 'secondary' | 'warning' | 'danger' }> = ({ onAddUser, variant }) => {
  const t = useTranslations();
  return (
    <EmptyState
      type="users"
      variant={variant}
      actions={[
        {
          label: t('emptyStates.users.addUser'),
          onClick: onAddUser,
          icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>,
        },
      ]}
    />
  );
};

export const EmptyOffices: React.FC<{ onAddOffice: () => void; variant?: 'primary' | 'secondary' | 'warning' | 'danger' }> = ({ onAddOffice, variant }) => {
  const t = useTranslations();
  return (
    <EmptyState
      type="offices"
      variant={variant}
      actions={[
        {
          label: t('emptyStates.offices.addOffice'),
          onClick: onAddOffice,
          icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>,
        },
      ]}
    />
  );
};

export const EmptyTasks: React.FC<{ isAdmin: boolean; onCreateTask?: () => void; variant?: 'primary' | 'secondary' | 'warning' | 'danger' }> = ({ isAdmin, onCreateTask, variant }) => {
  const t = useTranslations();
  return (
    <EmptyState
      type="tasks"
      variant={variant}
      title={isAdmin ? t('emptyStates.tasks.adminTitle') : t('emptyStates.tasks.userTitle')}
      description={isAdmin ? t('emptyStates.tasks.adminDescription') : t('emptyStates.tasks.userDescription')}
      actions={
        isAdmin && onCreateTask
          ? [
            {
              label: t('emptyStates.tasks.createTask'),
              onClick: onCreateTask,
              icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>,
            },
          ]
          : []
      }
    />
  );
};

export const EmptyAttendance: React.FC<{ onMarkAttendance?: () => void; variant?: 'primary' | 'secondary' | 'warning' | 'danger' }> = ({ onMarkAttendance, variant }) => {
  const t = useTranslations();
  return (
    <EmptyState
      type="attendance"
      variant={variant}
      actions={
        onMarkAttendance
          ? [
            {
              label: t('emptyStates.attendance.markAttendance'),
              onClick: onMarkAttendance,
              icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>,
            },
          ]
          : []
      }
    />
  );
};

export const EmptySalary: React.FC<{ onGenerateSalary?: () => void; variant?: 'primary' | 'secondary' | 'warning' | 'danger' }> = ({ onGenerateSalary, variant }) => {
  const t = useTranslations();
  return (
    <EmptyState
      type="salary"
      variant={variant}
      actions={
        onGenerateSalary
          ? [
            {
              label: t('emptyStates.salary.generateSalary'),
              onClick: onGenerateSalary,
              icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>,
            },
          ]
          : []
      }
    />
  );
};

export const EmptyReports: React.FC<{ onGenerateReport?: () => void; variant?: 'primary' | 'secondary' | 'warning' | 'danger' }> = ({ onGenerateReport, variant }) => {
  const t = useTranslations();
  return (
    <EmptyState
      type="reports"
      variant={variant}
      actions={
        onGenerateReport
          ? [
            {
              label: t('emptyStates.reports.generateReport'),
              onClick: onGenerateReport,
              icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>,
            },
          ]
          : []
      }
    />
  );
};

export const EmptyNotifications: React.FC<{ variant?: 'primary' | 'secondary' | 'warning' | 'danger' }> = ({ variant }) => (
  <EmptyState
    type="notifications"
    variant={variant}
  />
);

export const EmptyAudit: React.FC<{ onViewLogs?: () => void; variant?: 'primary' | 'secondary' | 'warning' | 'danger' }> = ({ onViewLogs, variant }) => {
  const t = useTranslations();
  return (
    <EmptyState
      illustration={getDefaultIllustration('audit', variant || 'primary')}
      type="audit"
      variant={variant}
      actions={
        onViewLogs
          ? [
            {
              label: t('emptyStates.audit.viewLogs'),
              onClick: onViewLogs,
              icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>,
            },
          ]
          : []
      }
    />
  );
};