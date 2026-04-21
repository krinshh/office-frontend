'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Skeleton, Alert } from '@/components';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store';
import { useRouter } from '@/navigation';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { AccessRestricted } from './AccessRestricted';
import { SalarySlipHeader } from './SalarySlipHeader';
import { SalaryBreakdown } from './SalaryBreakdown';

export function SalarySlipClient() {
  const { id } = useParams();
  const t = useTranslations();
  const [salary, setSalary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const isAdmin = hasPermission(PERMISSIONS.SALARY_VIEW_ALL);

  const {
    errors,
    success: successMsg,
    handleError,
    handleSuccess,
    clearErrors
  } = useErrorHandler(t);

  useEffect(() => {
    fetchSalary();
  }, [id]);

  useEffect(() => {
    // Ownership Check: If user is not admin AND we have salary data, check if it's their own
    if (user && !isAdmin && salary) {
      if (salary.user?._id !== user.id) {
        const timer = setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, isAdmin, router, salary]);

  const fetchSalary = async () => {
    try {
      setLoading(true);
      clearErrors();
      const res = await api.salary.getById(id as string);
      if (res.ok) {
        const data = await res.json();
        setSalary(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        handleError(errorData, t('salarySlip.notFound'));
      }
    } catch (err) {
      console.error('Error fetching salary:', err);
      handleError(err, t('salarySlip.notFound'));
    } finally {
      setLoading(false);
    }
  };

  const downloadSlip = async () => {
    if (!salary) return;

    try {
      const data = { salary };
      const res = await api.pdfs.generateSalarySlip(data);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `salary-slip-${salary.user?.name}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        handleSuccess(t('salary.pdfDownloadSuccess') || 'PDF downloaded successfully');
      } else {
        const errorData = await res.json().catch(() => ({}));
        handleError(errorData, t('salary.failedToGeneratePDF'));
      }
    } catch (err) {
      console.error('Error downloading slip:', err);
      handleError(err, t('salary.failedToGeneratePDF'));
    }
  };

  const isOwner = user && salary && (salary.user?._id === user.id);
  const canView = isAdmin || isOwner;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!salary) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">{t('salarySlip.notFound')}</p>
      </div>
    );
  }

  if (user && salary && !canView) {
    return <AccessRestricted t={t} />;
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex flex-col flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-none pb-1">
            {t('salarySlip.title')}
          </h1>
          <p className="text-muted-foreground leading-none pb-1">
            {t('salarySlip.subtitle')}
          </p>
        </div>
        <div className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full self-center">
          {t('salarySlip.officialSlip')}
        </div>
      </div>

      {errors.general && (
        <Alert
          type="error"
          message={errors.general}
          onClose={() => clearErrors()}
          className="mb-6"
        />
      )}

      {successMsg && (
        <Alert
          type="success"
          message={successMsg}
          onClose={() => clearErrors()}
          className="mb-6"
        />
      )}

      <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
        <SalarySlipHeader salary={salary} t={t} />
        <SalaryBreakdown salary={salary} t={t} downloadSlip={downloadSlip} />
      </div>
    </div>
  );
}
