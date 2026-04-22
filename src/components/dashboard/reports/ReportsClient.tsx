'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Alert } from '@/components';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import Shield from 'lucide-react/dist/esm/icons/shield';
import { useAuthStore } from '@/lib/store';
import { useAppStore } from '@/lib/appStore';
import { useTaskStore } from '@/lib/taskStore';
import { useSalaryStore } from '@/lib/salaryStore';
import { useAttendanceStore } from '@/lib/attendanceStore';
import { useRouter } from '@/navigation';
import { api } from '@/lib/api';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { ReportMetrics } from './ReportMetrics';
import { AttendanceReportSection } from './AttendanceReportSection';
import { TaskReportSection } from './TaskReportSection';
import { SalaryReportSection } from './SalaryReportSection';
import { formatDateIST } from '@/utils/dateUtils';

export function ReportsClient() {
  const t = useTranslations('reports');
  const router = useRouter();
  const { user } = useAuthStore();
  const { offices, userTypes, users, fetchOffices, fetchUserTypes, fetchUsers } = useAppStore();
  const {
    fetchAssignments,
    currentMonthStats: taskStats,
    fetchMonthlyStats
  } = useTaskStore();
  const { salaries, fetchSalaries } = useSalaryStore();
  const {
    livePresence, fetchLivePresence,
    currentMonthAttendanceCount: storeCount,
    fetchMonthlyCount
  } = useAttendanceStore();

  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    totalAttendance: 0,
    totalTasks: 0,
    totalSalaries: 0,
    presentToday: 0,
    absentToday: 0,
    tasksCompleted: 0,
    salariesProcessed: 0
  });

  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    errors,
    success: successMsg,
    handleError,
    handleSuccess,
    clearErrors,
    setSuccess: setSuccessMsg
  } = useErrorHandler(t);

  const { hasPermission } = usePermissions();
  const canViewReports = hasPermission(PERMISSIONS.REPORTS_VIEW);
  const userAccess = hasPermission(PERMISSIONS.USERS_VIEW);
  const attendanceAccess = hasPermission(PERMISSIONS.ATTENDANCE_VIEW_ALL);
  const taskAccess = hasPermission(PERMISSIONS.TASKS_VIEW_ALL);
  const salaryAccess = hasPermission(PERMISSIONS.SALARY_VIEW_ALL);

  const fetchAllData = useCallback(async () => {
    clearErrors();
    try {
      const promises: Promise<any>[] = [
        fetchOffices(false),
        fetchUserTypes(false),
      ];
      if (userAccess) promises.push(fetchUsers(false, { includeInactive: 'true' }));
      if (salaryAccess) promises.push(fetchSalaries(false, true));
      if (attendanceAccess) {
        promises.push(fetchLivePresence(false));
        promises.push(fetchMonthlyCount());
      }
      if (taskAccess) promises.push(fetchMonthlyStats());
      await Promise.all(promises);
    } catch (err) {
      handleError(err, t('errors.failedToFetchData'));
    } finally {
      setLoading(false);
    }
  }, [userAccess, salaryAccess, attendanceAccess, taskAccess, fetchOffices, fetchUserTypes, fetchUsers, fetchSalaries, fetchLivePresence, fetchMonthlyCount, fetchMonthlyStats, handleError, t, clearErrors]);

  const hasFetched = useRef(false);
  useEffect(() => {
    if (user && !canViewReports) {
      router.replace('/dashboard');
    } else if (user && canViewReports && !hasFetched.current) {
      hasFetched.current = true;
      fetchAllData();
    }
  }, [user, canViewReports, fetchAllData, router]);

  useEffect(() => {
    if (loading) return;
    let totalEmployees = users ? users.filter((u: any) => u.isActive !== false).length : 0;
    let presentToday = livePresence.filter((p: any) => p.status !== 'Absent').length;

    setMetrics({
      totalEmployees,
      totalAttendance: storeCount,
      totalTasks: taskStats.active,
      totalSalaries: salaries.length,
      presentToday,
      absentToday: totalEmployees - presentToday,
      tasksCompleted: taskStats.completed,
      salariesProcessed: salaries.filter((s: any) =>
        ['completed', 'Processed', 'processing'].includes(s.payoutStatus || s.status)
      ).length
    });
  }, [users, livePresence, storeCount, taskStats, salaries, loading]);

  const generateAllReports = async () => {
    setGenerating(true);
    clearErrors();
    try {
      window.dispatchEvent(new CustomEvent('generate-all-reports'));
      setSuccessMsg(t('success.reportGenerated'));
    } catch (err) {
      handleError(err);
    } finally {
      setGenerating(false);
    }
  };

  // If user is logged in but not an admin, show nothing while redirecting
  if (user && !canViewReports) {
    return null;
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      {errors.general && <Alert type="error" message={errors.general} onClose={() => clearErrors()} t={t} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} t={t} />}

      <div className="flex flex-col items-start md:flex-row md:items-center justify-between gap-2 mb-4 md:mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-none pb-1">{t('title')}</h1>
          <p className="text-muted-foreground leading-none pb-1">{t('subtitle')}</p>
        </div>
        <Button
          onClick={generateAllReports}
          disabled={generating}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 w-full sm:w-auto"
        >
          {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
          <span className="text-sm whitespace-nowrap leading-none">{t('buttons.generateAll')}</span>
        </Button>
      </div>

      <ReportMetrics metrics={metrics} permissions={{ userAccess, attendanceAccess, taskAccess, salaryAccess }} />

      <div className="space-y-4 md:space-y-6 lg:space-y-8">
        {attendanceAccess && <AttendanceReportSection />}
        {taskAccess && <TaskReportSection />}
        {salaryAccess && <SalaryReportSection />}
      </div>
    </div>
  );
}
