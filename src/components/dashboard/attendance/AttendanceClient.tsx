'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Button, Alert, Card } from '@/components';
import Eye from 'lucide-react/dist/esm/icons/eye';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Shield from 'lucide-react/dist/esm/icons/shield';
import { useAuthStore } from '@/lib/store';
import { useAppStore } from '@/lib/appStore';
import { useAttendanceStore } from '@/lib/attendanceStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';

import { AttendanceFilters } from './AttendanceFilters';
import { AttendanceSummary } from './AttendanceSummary';
import { AttendanceLivePresence } from './AttendanceLivePresence';
import { AttendanceOfficeStats } from './AttendanceOfficeStats';
import { AttendanceMonthlyDetails } from './AttendanceMonthlyDetails';

interface OfficeStats {
  office: string;
  totalEmployees: number;
  present: number;
  late: number;
  halfDay: number;
  absent: number;
  presentPercentage: string;
}

export function AttendanceClient() {
  const { user } = useAuthStore();
  const t = useTranslations();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const isAdmin = hasPermission(PERMISSIONS.ATTENDANCE_VIEW_ALL);

  const [viewMode, setViewMode] = useState<'overview' | 'monthly'>('overview');
  const [filters, setFilters] = useState({
    office: '',
    userType: '',
    user: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const { users, userTypes, offices, fetchUsers, fetchUserTypes, fetchOffices } = useAppStore();
  const {
    livePresence,
    adminSelectedUserAttendance: monthlyAttendance, fetchUserMonthlyAttendance,
    fetchLivePresence
  } = useAttendanceStore();

  const {
    errors,
    handleError,
    clearErrors,
  } = useErrorHandler(t);

  const init = useCallback(async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchUserTypes(),
        fetchOffices(),
        fetchLivePresence(false)
      ]);
    } catch (err) {
      handleError(err, t('attendance.errors.failedToLoad'));
    }
  }, [fetchUsers, fetchUserTypes, fetchOffices, fetchLivePresence, handleError, t]);

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard');
    } else if (user) {
      init();
    }
  }, [user, isAdmin, router, init]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (viewMode === 'monthly' && filters.user) {
        fetchUserMonthlyAttendance(filters.user, filters.month, filters.year);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filters.user, filters.month, filters.year, viewMode, fetchUserMonthlyAttendance]);

  useEffect(() => {
    if (viewMode === 'overview') {
      fetchLivePresence(false);
    }
  }, [viewMode, fetchLivePresence]);

  const filteredUsers = useMemo(() => users.filter(user => {
    if (filters.office) {
      const userOfficeId = typeof user.office === 'string' ? user.office : user.office?._id;
      if (userOfficeId !== filters.office) return false;
    }
    if (filters.userType) {
      const userTypeId = typeof user.userType === 'string' ? user.userType : user.userType?._id;
      if (userTypeId !== filters.userType) return false;
    }
    return true;
  }), [users, filters]);

  const filteredLivePresence = useMemo(() => {
    return livePresence.filter(p => {
      if (filters.office) {
        const officeName = offices.find(o => o._id === filters.office)?.name;
        if (p.office !== officeName) return false;
      }
      if (filters.userType) {
        const typeName = userTypes.find(t => t._id === filters.userType)?.name;
        if (p.userType !== typeName) return false;
      }
      return true;
    });
  }, [livePresence, filters, offices, userTypes]);

  const activeFilteredCount = useMemo(() =>
    filteredLivePresence.filter(p => p.isClockedIn).length,
    [filteredLivePresence]);

  const stats = useMemo(() => {
    const source = filteredLivePresence;
    const total = source.length;
    const present = source.filter(p => p.status !== 'Absent').length;
    const absent = total - present;

    const officeMap = new Map<string, { present: number; absent: number; total: number }>();
    source.forEach(p => {
      const s = officeMap.get(p.office) || { present: 0, absent: 0, total: 0 };
      s.total++;
      if (p.status !== 'Absent') s.present++;
      else s.absent++;
      officeMap.set(p.office, s);
    });

    const officeStats: OfficeStats[] = Array.from(officeMap.entries()).map(([name, s]) => ({
      office: name,
      totalEmployees: s.total,
      present: s.present,
      late: 0,
      halfDay: 0,
      absent: s.absent,
      presentPercentage: s.total > 0 ? ((s.present / s.total) * 100).toFixed(1) : '0.0'
    }));

    return { totalEmployees: total, totalPresent: present, totalAbsent: absent, officeWiseStats: officeStats };
  }, [filteredLivePresence]);

  useEffect(() => {
    if (filters.user && viewMode === 'monthly') {
      const userExists = filteredUsers.find(u => u._id === filters.user);
      if (!userExists) {
        setFilters(prev => ({ ...prev, user: '' }));
        handleError({ message: t('attendance.messages.userFilterCleared') });
      }
    }
  }, [filters.office, filters.userType, filteredUsers, viewMode, t, handleError]);

  if (user && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <Shield className="w-12 h-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-destructive mb-2">{t('common.accessRestricted')}</h1>
        <p className="text-muted-foreground">{t('common.accessRestrictedMessage')}</p>
      </div>
    );
  }

  const officeOptions = offices.map(o => ({ value: o._id, label: o.name }));
  const userTypeOptions = userTypes.map(t => ({ value: t._id, label: t.name }));
  const userOptions = filteredUsers.map(u => ({ value: u._id, label: u.name }));

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4 w-full">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl font-bold text-foreground leading-none pb-1">{t('attendance.title')}</h1>
          <p className="text-muted-foreground leading-none pb-1">{t('attendance.subtitle')}</p>
        </div>
        <div className="flex gap-1 w-full sm:w-auto bg-muted/50 p-1.5 rounded-xl border border-border/50">
          <Button
            onClick={() => setViewMode('overview')}
            variant="ghost"
            className={`flex-1 flex items-center justify-center gap-2 px-4 h-9 rounded-lg transition-all w-full sm:w-auto ${viewMode === 'overview' ? 'bg-background shadow-sm text-foreground font-medium' : 'text-foreground hover:text-foreground'}`}
            size="sm"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm">{t('attendance.overview')}</span>
          </Button>
          <Button
            onClick={() => setViewMode('monthly')}
            variant="ghost"
            className={`flex-1 flex items-center justify-center gap-2 px-4 h-9 rounded-lg transition-all w-full sm:w-auto ${viewMode === 'monthly' ? 'bg-background shadow-sm text-foreground font-medium' : 'text-foreground hover:text-foreground'}`}
            size="sm"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{t('attendance.monthly')}</span>
          </Button>
        </div>
      </div>

      {errors.general && <Alert type="error" message={errors.general} onClose={() => clearErrors()} />}

      <AttendanceFilters
        filters={filters}
        setFilters={setFilters}
        viewMode={viewMode}
        officeOptions={officeOptions}
        userTypeOptions={userTypeOptions}
        userOptions={userOptions}
      />

      {viewMode === 'overview' ? (
        <>
          <AttendanceSummary
            totalEmployees={stats.totalEmployees}
            totalPresent={stats.totalPresent}
            totalAbsent={stats.totalAbsent}
          />
          <AttendanceLivePresence
            filteredLivePresence={filteredLivePresence}
            activeFilteredCount={activeFilteredCount}
          />
          <AttendanceOfficeStats
            officeWiseStats={stats.officeWiseStats}
          />
        </>
      ) : (
        <AttendanceMonthlyDetails
          monthlyAttendance={monthlyAttendance}
          user={users.find(u => u._id === filters.user)}
          filters={filters}
        />
      )}
    </div>
  );
}
