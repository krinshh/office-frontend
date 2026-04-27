'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { useAttendanceStore } from '@/lib/attendanceStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { api } from '@/lib/api';
import { offlineStore } from '@/lib/offlineStore';
import dynamic from 'next/dynamic';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Navigation from 'lucide-react/dist/esm/icons/navigation';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import Spinner from '@/components/Spinner';
import Card from '@/components/Card';
import { EmptyAttendance } from '@/components/EmptyState';

import { LiveTimeDisplay } from './LiveTimeDisplaySelection';
import { WeeklyGrid } from './WeeklyGrid';

const GeoFenceMap = dynamic(() => import('@/components/GeoFenceMap'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-xl border border-border" />
});

export function UserAttendanceClient() {
  const { user } = useAuthStore();
  const t = useTranslations();
  const { hasPermission } = usePermissions();

  // Requirement: person with permission (ATTENDANCE_VIEW_ALL) should also see the map 
  // or anyone allowed on this page.
  const canViewMap = hasPermission(PERMISSIONS.ATTENDANCE_VIEW_ALL) || !!user;

  const { myAttendance, fetchMyAttendance, isFetching: attendanceFetching } = useAttendanceStore();
  const {
    errors,
    success,
    setLoading,
    handleError,
    handleSuccess,
    clearErrors,
    setSuccess
  } = useErrorHandler(t);

  const [status, setStatus] = useState<'in' | 'out' | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const isRequestPending = useRef(false);

  const todayRecord = useMemo(() => {
    const today = new Date().toDateString();
    return myAttendance.find(att => new Date(att.date).toDateString() === today);
  }, [myAttendance]);

  useEffect(() => {
    if (todayRecord) {
      const openSession = todayRecord.sessions?.find((s: any) => !s.outTime);
      if (openSession) {
        setStatus('in');
        setCheckInTime(new Date(openSession.inTime).toLocaleTimeString());
        setCheckOutTime(null);
      } else {
        setStatus('out');
        const sessions = todayRecord.sessions || [];
        if (sessions.length > 0) {
          const lastSession = sessions[sessions.length - 1];
          setCheckInTime(new Date(lastSession.inTime).toLocaleTimeString());
          if (lastSession.outTime) {
            setCheckOutTime(new Date(lastSession.outTime).toLocaleTimeString());
          }
        }
      }
    } else {
      setStatus(null);
      setCheckInTime(null);
      setCheckOutTime(null);
    }
  }, [todayRecord]);

  useEffect(() => {
    let watchId: any;
    let lastUpdateTime = 0;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const now = Date.now();
          if (now - lastUpdateTime > 2000) {
            setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            lastUpdateTime = now;
          }
        },
        (err) => console.warn('Geo tracking error:', err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, []);

  const syncOfflineAttendance = useCallback(async () => {
    if (!navigator.onLine) return;
    const pending = await offlineStore.getAllPending();
    if (pending.length === 0) return;
    setIsSyncing(true);
    try {
      const idsToClear: number[] = [];
      for (const item of pending) {
        let response;
        if (item.type === 'in') {
          response = await api.attendance.markIn({
            latitude: item.latitude, longitude: item.longitude,
            office: item.office, offlineTimestamp: item.timestamp
          });
        } else {
          response = await api.attendance.markOut({
            latitude: item.latitude, longitude: item.longitude,
            offlineTimestamp: item.timestamp
          });
        }
        if (response.ok) idsToClear.push(item.id);
      }
      if (idsToClear.length > 0) {
        await offlineStore.clearPending(idsToClear);
        handleSuccess(t('userAttendance.messages.syncSuccess'));
        fetchMyAttendance(true);
      }
    } catch (error) {
      handleError(error, t('userAttendance.messages.syncFailed'));
    } finally {
      setIsSyncing(false);
    }
  }, [fetchMyAttendance, handleError, handleSuccess, t]);

  useEffect(() => {
    const init = async () => {
      if (user) {
        try {
          await fetchMyAttendance(false);
          await syncOfflineAttendance();
        } catch (error) { }
      }
    };
    init();
    window.addEventListener('online', syncOfflineAttendance);
    return () => window.removeEventListener('online', syncOfflineAttendance);
  }, [user, fetchMyAttendance, syncOfflineAttendance]);

  const checkShiftWindow = () => {
    if (!user?.shiftTimings) return { allowed: true };
    const now = new Date();
    const [startH, startM] = user.shiftTimings.start.split(':').map(Number);
    const [endH, endM] = user.shiftTimings.end.split(':').map(Number);
    const windowStart = new Date(now);
    windowStart.setHours(startH, startM - 15, 0, 0);
    const windowEnd = new Date(now);
    windowEnd.setHours(endH, endM + 60, 0, 0);
    if (now < windowStart) return { allowed: false, message: t('userAttendance.errors.tooEarly', { time: windowStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }) };
    if (now > windowEnd) return { allowed: false, message: t('userAttendance.errors.tooLate', { time: windowEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }) };
    return { allowed: true };
  };

  const handleMarkIn = async () => {
    if (actionLoading || isRequestPending.current) return;
    const { allowed, message: windowMessage } = checkShiftWindow();
    if (!allowed) { handleError({ message: windowMessage || '' }); return; }
    if (!currentLocation) { handleError({ message: t('userAttendance.errors.waitingForLocation') }); return; }
    setActionLoading(true);
    isRequestPending.current = true;
    window.setTimeout(async () => {
      try {
        if (!currentLocation) return;
        const { lat: latitude, lng: longitude } = currentLocation;
        const officeId = typeof user?.office === 'object' ? (user.office._id || user.office.id) : user?.office;
        if (!navigator.onLine) {
          await offlineStore.addAttendance({ type: 'in', latitude, longitude, office: officeId || null, userId: user?.id || '', timestamp: new Date().toISOString() });
          setStatus('in');
          setCheckInTime(new Date().toLocaleTimeString());
          handleSuccess(t('userAttendance.messages.offlineMarked'));
          setActionLoading(false);
          isRequestPending.current = false;
          return;
        }
        const response = await api.attendance.markIn({ latitude, longitude, office: officeId || null });
        if (response.ok) {
          handleSuccess(t('userAttendance.successfullyCheckedIn'));
          await fetchMyAttendance(true);
        } else {
          handleError(await response.json().catch(() => ({})), t('userAttendance.failedToMarkAttendance'));
        }
      } catch (error) {
        handleError(error, t('userAttendance.failedToMarkAttendance'));
      } finally {
        setActionLoading(false);
        isRequestPending.current = false;
      }
    }, 0);
  };

  const handleMarkOut = async () => {
    if (actionLoading || isRequestPending.current) return;
    if (!currentLocation) { handleError({ message: t('userAttendance.errors.waitingForLocation') }); return; }
    setActionLoading(true);
    isRequestPending.current = true;
    window.setTimeout(async () => {
      try {
        if (!currentLocation) return;
        const { lat: latitude, lng: longitude } = currentLocation;
        if (!navigator.onLine) {
          await offlineStore.addAttendance({ type: 'out', latitude, longitude, userId: user?.id || '', timestamp: new Date().toISOString() });
          setStatus('out');
          setCheckOutTime(new Date().toLocaleTimeString());
          handleSuccess(t('userAttendance.messages.offlineMarked'));
          setActionLoading(false);
          isRequestPending.current = false;
          return;
        }
        const response = await api.attendance.markOut({ latitude, longitude });
        if (response.ok) {
          handleSuccess(t('userAttendance.successfullyCheckedOut'));
          await fetchMyAttendance(true);
        } else {
          handleError(await response.json().catch(() => ({})), t('userAttendance.failedToMarkAttendance'));
        }
      } catch (error) {
        handleError(error, t('userAttendance.failedToMarkAttendance'));
      } finally {
        setActionLoading(false);
        isRequestPending.current = false;
      }
    }, 0);
  };

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-none pb-1">{t('userAttendance.title')}</h1>
          <p className="text-muted-foreground leading-none pb-1">{t('userAttendance.subtitle')}</p>
        </div>
      </div>

      {errors.general && <Alert type="error" message={errors.general} onClose={() => clearErrors()} t={t} />}
      {success && <Alert type="success" message={success} onClose={() => clearErrors()} t={t} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        <Card className="p-4 md:p-6">
          <div className="flex items-center mb-4 md:mb-6">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
              <MapPin className="w-6 h-6 text-secondary" />
            </div>
            <h2 className="text-xl font-bold text-card-foreground">{t('userAttendance.sections.markAttendance')}</h2>
          </div>
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-4">
              <LiveTimeDisplay t={t} />
              {currentLocation && <div className="flex items-center gap-2 p-3 border border-border rounded-lg"><MapPin className="w-4 h-4 text-secondary" /><span className="text-foreground text-sm">{t('userAttendance.labels.location')} {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</span></div>}
              {user?.office && <div className="flex items-center gap-2 p-3 border border-border rounded-lg"><MapPin className="w-4 h-4 text-secondary" /><span className="text-foreground text-sm">{t('userAttendance.labels.office')} {typeof user.office === 'object' ? user.office.name : 'Assigned Office'}</span></div>}
              {user?.shiftTimings && <div className="flex items-center gap-2 p-3 border border-border rounded-lg"><Clock className="w-4 h-4 text-secondary" /><span className="text-foreground text-sm">{t('userAttendance.labels.shift')} {user.shiftTimings.start} - {user.shiftTimings.end}</span></div>}
              {checkInTime && <div className="flex items-center gap-2 p-3 border border-secondary bg-secondary/10 rounded-lg"><CheckCircle className="w-4 h-4 text-secondary" /><span className="text-foreground text-sm">{t('userAttendance.labels.checkInTime')} {checkInTime}</span></div>}
            </div>

            {/* Map logic - Refined check */}
            {canViewMap && user?.office && typeof user.office === 'object' && user.office.location && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-secondary" />{t('userAttendance.labels.officeBoundary')}
                  </h3>
                </div>
                <GeoFenceMap userLocation={currentLocation} officeLocation={user.office.location} radius={user.office.radius || 100} />
                <p className="text-[10px] text-muted-foreground text-center italic">{t('userAttendance.messages.mapInstruction')}</p>
              </div>
            )}

            <div className="flex gap-4 md:gap-6">
              <Button onClick={handleMarkIn} className="flex-1" disabled={status === 'in' || actionLoading || !user} variant='secondary'>
                {actionLoading ? <Spinner size="sm" /> : <CheckCircle className="w-4 h-4" />}{t('userAttendance.buttons.checkIn')}
              </Button>
              <Button onClick={handleMarkOut} disabled={status !== 'in' || actionLoading || !user} variant="outline2" className="flex-1">
                {actionLoading ? <Spinner size="sm" /> : <XCircle className="w-4 h-4" />}{t('userAttendance.buttons.checkOut')}
              </Button>
            </div>

            <div className="p-4 border border-border rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">{t('userAttendance.labels.quickStats')}</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-2 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-secondary">{myAttendance.filter((att: any) => att.status !== 'Absent').length}</div>
                  <div className="text-xs font-semibold text-secondary">{t('userAttendance.labels.presentDays')}</div>
                </div>
                <div className="p-2 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-destructive">{myAttendance.filter((att: any) => att.status === 'Late').length}</div>
                  <div className="text-xs font-semibold text-destructive">{t('userAttendance.labels.lateDays')}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center mb-4 md:mb-6">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
              <Calendar className="w-6 h-6 text-secondary" />
            </div>
            <h2 className="text-xl font-bold text-card-foreground">{t('userAttendance.sections.todaysSummary')}</h2>
          </div>
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="p-4 border border-border rounded-lg text-center">
                <div className="text-2xl font-bold text-secondary">
                  {todayRecord ? (todayRecord.status === 'Present' || todayRecord.status === 'Half-Day' || todayRecord.status === 'Late' ? (todayRecord.outTime ? todayRecord.status : t('userAttendance.status.checkedIn')) : todayRecord.status) : t('userAttendance.status.notCheckedIn')}
                </div>
                <div className="text-sm text-muted-foreground">{t('userAttendance.labels.status')}</div>
              </div>
              <div className="p-4 border border-border rounded-lg text-center">
                <div className="text-2xl font-bold text-secondary">
                  {todayRecord && todayRecord.outTime ? new Date(todayRecord.outTime).toLocaleTimeString() : t('userAttendance.status.noTime')}
                </div>
                <div className="text-sm text-muted-foreground">{t('userAttendance.labels.checkOutTime')}</div>
              </div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="text-sm font-medium text-foreground mb-3">{t('userAttendance.labels.recentAttendance')}</h3>
              {myAttendance.length > 0 ? (
                <div className="space-y-2 max-h-42 overflow-y-auto">
                  {myAttendance.slice(0, 5).map((att: any) => (
                    <div key={att._id} className="flex justify-between items-center p-2 border border-border rounded">
                      <div>
                        <div className="text-xs text-foreground font-medium">{new Date(att.date).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">In: {new Date(att.inTime).toLocaleTimeString()}{att.outTime && <span className="ml-1">- Out: {new Date(att.outTime).toLocaleTimeString()}</span>}</div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full font-bold ${att.status === 'Present' ? 'border border-secondary text-secondary' :
                        att.status === 'Late' ? 'border border-warning text-warning' :
                          att.status === 'Half-Day' ? 'border border-primary text-primary' :
                            'border border-destructive text-destructive'}`}>
                        {t(`userAttendance.status.${att.status.toLowerCase().replace('-', '')}`)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (!attendanceFetching.myAttendance && <EmptyAttendance onMarkAttendance={() => handleMarkIn()} variant="secondary" />)}
            </div>
          </div>
        </Card>
      </div>

      <Card className='p-4 md:p-6'>
        <div className="flex items-center mb-4 md:mb-6">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-secondary" />
          </div>
          <h2 className="text-xl font-bold text-card-foreground">{t('userAttendance.sections.weeklyOverview')}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 md:gap-6">
          <WeeklyGrid myAttendance={myAttendance} t={t} />
        </div>
      </Card>
    </div>
  );
}
