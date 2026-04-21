'use client';

import { useTranslations } from 'next-intl';

export const StatusIndicator = ({ status, size = 'sm', showIcon = true }: { status: string; size?: 'sm' | 'md'; showIcon?: boolean }) => {
  const t = useTranslations();

  const statusConfig = {
    'Completed': {
      bg: 'bg-secondary/10 border-secondary/20',
      text: 'text-secondary',
      icon: '✓',
      label: t('tasks.status.completed')
    },
    'In Progress': {
      bg: 'bg-primary/10 border-primary/20',
      text: 'text-primary',
      icon: '⟳',
      label: t('tasks.status.inProgress')
    },
    'Pending': {
      bg: 'bg-warning/10 border-warning/20',
      text: 'text-warning',
      icon: '⏳',
      label: t('tasks.status.pending')
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    bg: 'bg-muted border-border',
    text: 'text-muted-foreground',
    icon: '?',
    label: t('tasks.unknownStatus')
  };

  const sizeClasses = size === 'md' ? 'px-4 py-2 text-sm' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${config.bg} ${config.text} ${sizeClasses}`}>
      {showIcon && <span className="text-xs">{config.icon}</span>}
      {config.label}
    </span>
  );
};

export const PriorityIndicator = ({ priority }: { priority: string }) => {
  const t = useTranslations();
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'High':
        return { color: 'bg-destructive', label: t('tasks.high') };
      case 'Medium':
        return { color: 'bg-warning', label: t('tasks.medium') };
      case 'Low':
        return { color: 'bg-secondary', label: t('tasks.low') };
      default:
        return { color: 'bg-gray-500', label: t('tasks.unknownPriority') };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
      <span className="text-muted-foreground text-sm font-medium">{config.label}</span>
    </div>
  );
};

export const DueDateIndicator = ({ dueDate }: { dueDate?: string }) => {
  const t = useTranslations();
  if (!dueDate) return null;

  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status = 'normal';
  let text = '';

  if (diffDays < 0) {
    status = 'overdue';
    text = t('tasks.daysOverdue', { count: Math.abs(diffDays) });
  } else if (diffDays === 0) {
    status = 'due-today';
    text = t('tasks.dueToday');
  } else if (diffDays <= 3) {
    status = 'due-soon';
    text = t('tasks.dueInDays', { count: diffDays });
  } else {
    text = t('tasks.dueOn', { date: due.toLocaleDateString() });
  }

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'due-today':
      case 'due-soon':
        return 'text-warning bg-warning/10 border-warning/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${getStatusClasses(status)}`}>
      <span>📅</span>
      {text}
    </div>
  );
};
