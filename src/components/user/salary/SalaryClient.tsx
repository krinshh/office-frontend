'use client';

import { useState, useEffect } from 'react';
import { Alert } from '@/components';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useSalaryStore } from '@/lib/salaryStore';
import { useConfigStore } from '@/lib/configStore';
import { useAppStore } from '@/lib/appStore';
import { useAttendanceStore } from '@/lib/attendanceStore';
import { useTranslations } from 'next-intl';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { SalaryCard } from './SalaryCard';
import { ExpectedSalaryDisplay } from './ExpectedSalaryDisplay';

export function SalaryClient() {
  const { user } = useAuthStore();
  const t = useTranslations();
  const {
    errors,
    success,
    handleError,
    handleSuccess,
    clearErrors,
    setSuccess
  } = useErrorHandler(t);

  // Store states
  const { fetchOffices, fetchUserTypes } = useAppStore();
  const { config, hraSlabs, fetchConfig, fetchHRASlabs } = useConfigStore();
  const { salaries, fetchSalaries } = useSalaryStore();
  const { myAttendance, fetchMyAttendance } = useAttendanceStore();

  // Salary States for non-admin overview
  const [currentSalary, setCurrentSalary] = useState<any>(null);
  const [previousSalary, setPreviousSalary] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [!!user]);

  const fetchData = async () => {
    try {
      // Verification path for Zero GET user data - fetch if base data missing
      if (!user || !user.baseSalary || !user.joiningDate) {
        console.log('SalaryClient: Profile data incomplete, fetching full profile');
        const profileRes = await api.auth.getMe();
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          useAuthStore.getState().updateUserData({
            ...profileData,
            id: profileData._id
          });
        }
      }

      // Parallel fetch using stores (optimized "Zero Get" logic)
      const corePromises = [
        fetchConfig(),
        fetchOffices(),
        fetchUserTypes(),
        fetchHRASlabs(),
        fetchSalaries(false, false)
      ];

      await Promise.all(corePromises);

      if (user) {
        await fetchMyAttendance(false);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      handleError(error, t('salary.failedToFetchData'));
    }
  };

  // Derived state for current/previous salary
  useEffect(() => {
    if (user && salaries.length > 0) {
      const userSalaries = salaries.filter((s: any) => (s.user?._id || s.user) === user.id);

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const currentMonthSalary = userSalaries.find((s: any) => s.month === currentMonth && s.year === currentYear);

      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const previousMonthSalary = userSalaries.find((s: any) => s.month === prevMonth && s.year === prevYear);

      setCurrentSalary(currentMonthSalary || null);
      setPreviousSalary(previousMonthSalary || null);
    }
  }, [salaries, !!user]);

  const downloadPDF = async (salary: any = null) => {
    if (!salary) return;

    try {
      const salaryData = {
        user: user,
        month: salary?.month || new Date().getMonth() + 1,
        year: salary?.year || new Date().getFullYear(),
        ...salary
      };

      const res = await api.pdfs.generateSalarySlip({ salary: salaryData });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'salary-slip.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        handleSuccess(t('salary.pdfDownloadSuccess'));
      } else {
        const errorData = await res.json().catch(() => ({}));
        handleError(errorData, t('salary.failedToGeneratePDF'));
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      handleError(error, t('salary.failedToGeneratePDF'));
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-none pb-1">
            {t('salary.title')}
          </h1>
          <p className="text-muted-foreground leading-none pb-1">
            {t('salary.subtitle')}
          </p>
        </div>
      </div>

      {errors.general && <Alert type="error" message={errors.general} onClose={() => clearErrors()} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="grid grid-cols-1 gap-6">
        {/* Current Month Section */}
        {currentSalary ? (
          <SalaryCard
            salary={currentSalary}
            title={t('salary.currentMonthSalary')}
            t={t}
            isCurrent={true}
            downloadPDF={downloadPDF}
          />
        ) : (
          <ExpectedSalaryDisplay
            user={user}
            config={config}
            hraSlabs={hraSlabs}
            myAttendance={myAttendance}
            t={t}
            fetchData={fetchData}
          />
        )}

        {/* Previous Month Section */}
        {previousSalary && (
          <SalaryCard
            salary={previousSalary}
            title=""
            t={t}
            isCurrent={false}
            downloadPDF={downloadPDF}
          />
        )}
      </div>
    </div>
  );
}
