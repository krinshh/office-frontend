'use client';

import { TaskAdminClient } from '@/components/dashboard/tasks/TaskAdminClient';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import Shield from 'lucide-react/dist/esm/icons/shield';
import { useTranslations } from 'next-intl';

export default function TasksPage() {
  const t = useTranslations();
  const { hasPermission } = usePermissions();
  const isAdmin = hasPermission(PERMISSIONS.TASKS_VIEW_ALL);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="bg-destructive/10 p-4 rounded-full mb-4 md:bg-destructive/50">
          <Shield className="w-12 h-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-destructive mb-2">{t('common.accessRestricted')}</h1>
        <p className="text-muted-foreground">{t('common.accessRestrictedMessage')}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full">
      <TaskAdminClient />
    </div>
  );
}
