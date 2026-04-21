'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/components';
import Shield from 'lucide-react/dist/esm/icons/shield';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useRouter } from '@/navigation';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { AuditFilters } from './AuditFilters';
import { AuditTable } from './AuditTable';

export function AuditClient() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    errors,
    success: successMsg,
    handleError,
    clearErrors,
    setSuccess: setSuccessMsg
  } = useErrorHandler(t);

  const { hasPermission } = usePermissions();
  const isAdmin = hasPermission(PERMISSIONS.AUDIT_LOGS_VIEW);
  console.log("hi");

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, router]);

  // Filters
  const [filters, setFilters] = useState({
    user: '',
    action: '',
    resource: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50,
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce filter changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filters]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchLogs();
  }, [debouncedFilters, isAdmin]);

  const fetchLogs = async () => {
    if (debouncedFilters.startDate && debouncedFilters.endDate && debouncedFilters.startDate > debouncedFilters.endDate) {
      handleError({ message: t('audit.invalidDateRange') || 'Start date cannot be after end date' });
      return;
    }

    setLoading(true);
    clearErrors();
    try {
      const res = await api.audit.getLogs(debouncedFilters);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.audits);
        setTotalPages(data.totalPages);
      } else {
        const errorData = await res.json().catch(() => ({}));
        handleError(errorData, t('apiErrors.fetchAuditLogsFailed'));
      }
    } catch (error) {
      console.error('Failed to fetch logs', error);
      handleError(error, t('apiErrors.fetchAuditLogsFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'startDate' && filters.endDate && value > filters.endDate) {
      setFilters(prev => ({ ...prev, [key]: value, endDate: '', page: 1 }));
      return;
    }
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="bg-destructive/10 p-4 rounded-full mb-4 md:bg-destructive/50 text-destructive">
          <Shield className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold text-destructive mb-2">{t('audit.accessDenied')}</h1>
        <p className="text-muted-foreground">{t('common.accessRestrictedMessage')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-none pb-1">
            {t('audit.title')}
          </h1>
          <p className="text-muted-foreground leading-none pb-1">
            {t('audit.subtitle')}
          </p>
        </div>
      </div>

      {errors.general && <Alert type="error" message={errors.general} onClose={() => clearErrors()} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      <AuditFilters filters={filters} onFilterChange={handleFilterChange} />

      <AuditTable
        logs={logs}
        loading={loading}
        onRefresh={fetchLogs}
        totalPages={totalPages}
        currentPage={filters.page}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
