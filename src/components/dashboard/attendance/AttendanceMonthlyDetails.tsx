'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Users from 'lucide-react/dist/esm/icons/users';

interface AttendanceMonthlyDetailsProps {
  monthlyAttendance: any[];
  user: any;
  filters: { user: string };
}

export const AttendanceMonthlyDetails = ({
  monthlyAttendance,
  user,
  filters
}: AttendanceMonthlyDetailsProps) => {
  const t = useTranslations();

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center mb-4 md:mb-6 pb-4 border-b border-border">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {t('attendance.monthlyView.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filters.user ? t('attendance.monthlyView.subtitle', { user: user?.name || '' }) : t('attendance.emptyStates.selectUser')}
          </p>
        </div>
      </div>

      {filters.user ? (
        monthlyAttendance.length > 0 ? (
          <div className="space-y-4 md:space-y-6">
            {monthlyAttendance.map((record) => (
              <div key={record._id} className="group p-4 border border-border/60 rounded-xl hover:bg-muted/30 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${record.status === 'Present' ? 'border border-border/60 text-secondary' :
                      record.status === 'Late' ? 'border border-border/60 text-destructive' :
                        record.status === 'Half-Day' ? 'border border-border/60 text-primary' : 'border border-border/60 text-muted-foreground'
                      }`}>
                      <span className="text-lg font-bold">{new Date(record.date).getDate()}</span>
                    </div>

                    <div>
                      <p className="font-semibold text-foreground text-sm uppercase tracking-wide">
                        {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long' })}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          {t('attendance.monthlyView.inTime')} {record.inTime ? new Date(record.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                          {t('attendance.monthlyView.outTime')} {record.sessions?.some((s: any) => !s.outTime) ? '-' : (record.outTime ? new Date(record.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${record.status === 'Present' ? 'bg-secondary/10 text-secondary border border-secondary' :
                      record.status === 'Half-Day' ? 'text-primary border border-primary' :
                        record.status === 'Late' ? ' text-destructive border border-destructive' :
                          record.status === 'Present' ? 'text-secondary border border-secondary' :
                            'text-muted-foreground'
                      }`}>
                      {record.status === 'Present' ? t('attendance.status.present') :
                        record.status === 'Half-Day' ? t('attendance.status.half-day') :
                          record.status === 'Late' ? t('attendance.status.late') :
                            record.status === 'Absent' ? t('attendance.status.absent') :
                              record.status}
                    </span>

                    {record.lateMinutes > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-destructive px-2 py-0.5 rounded-md">
                        <TrendingUp className="w-3 h-3" />
                        {t('attendance.monthlyView.lateBy', { minutes: record.lateMinutes })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 flex flex-col items-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">{t('attendance.emptyStates.noRecords')}</h3>
            <p className="text-muted-foreground text-sm">{t('attendance.emptyStates.noRecordsDesc') || 'No attendance records found for this user in the selected month.'}</p>
          </div>
        )
      ) : (
        <div className="text-center py-16 flex flex-col items-center border-2 border-dashed border-border/50 rounded-xl bg-muted/5">
          <div className="p-4 bg-muted/50 rounded-full mb-4">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">{t('attendance.emptyStates.selectUser')}</h3>
          <p className="text-muted-foreground text-sm max-w-sm">{t('attendance.emptyStates.selectUserDesc')}</p>
        </div>
      )}
    </Card>
  );
};
