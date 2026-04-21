import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import { Card } from '@/components';
import { useTranslations } from 'next-intl';

interface AttendanceStats {
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  currentStreak: number;
}

interface AttendanceStatsCardProps {
  stats: AttendanceStats;
}

export const AttendanceStatsCard = ({ stats }: AttendanceStatsCardProps) => {
  const t = useTranslations();

  return (
    <Card className="p-4 md:p-6 space-y-4 md:space-y-6 border-border/60 shadow-sm">
      <div className="flex items-center mb-4 md:mb-6 pb-4 border-b border-border/60">
        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
          <TrendingUp className="w-6 h-6 text-secondary" />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          {t('userProfile.sections.attendanceStatistics')}
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="text-center p-4 rounded-lg border border-border/80">
          <div className="text-2xl font-bold text-muted-foreground mb-1">
            {stats.totalPresent}
          </div>
          <div className="text-xs font-medium text-foreground uppercase tracking-wider">{t('userProfile.labels.presentDays')}</div>
        </div>

        <div className="text-center p-4 rounded-lg border border-border/80">
          <div className="text-2xl font-bold text-muted-foreground mb-1">
            {stats.totalLate}
          </div>
          <div className="text-xs font-medium text-foreground uppercase tracking-wider">{t('userProfile.labels.lateDays')}</div>
        </div>

        <div className="text-center p-4 rounded-lg border border-border/80">
          <div className="text-2xl font-bold text-muted-foreground mb-1">
            {stats.totalAbsent}
          </div>
          <div className="text-xs font-medium text-foreground uppercase tracking-wider">{t('userProfile.labels.absentDays')}</div>
        </div>

        <div className="text-center p-4 rounded-lg border border-border/80">
          <div className="text-2xl font-bold text-muted-foreground mb-1">
            {stats.currentStreak}
          </div>
          <div className="text-xs font-medium text-foreground uppercase tracking-wider">{t('userProfile.labels.currentStreak')}</div>
        </div>
      </div>
    </Card>
  );
};
