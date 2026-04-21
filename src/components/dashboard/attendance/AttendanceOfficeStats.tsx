'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';

interface OfficeStats {
  office: string;
  totalEmployees: number;
  present: number;
  late: number;
  halfDay: number;
  absent: number;
  presentPercentage: string;
}

interface AttendanceOfficeStatsProps {
  officeWiseStats: OfficeStats[];
}

export const AttendanceOfficeStats = ({
  officeWiseStats
}: AttendanceOfficeStatsProps) => {
  const t = useTranslations();

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center mb-4 md:mb-6 pb-4 border-b border-border">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
          <BarChart3 className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {t('attendance.officeWise.title')}
        </h2>
      </div>

      {officeWiseStats.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {officeWiseStats.map((stat, index) => (
            <div key={index} className="p-5 border border-border/60 rounded-xl hover:border-border hover:bg-muted/30 transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {stat.office}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-background">
                    {t('attendance.status.percentagePresent', { percentage: stat.presentPercentage })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-muted/5 rounded-lg border border-border/60 text-center">
                  <div className="text-xl font-bold text-secondary">
                    {stat.present}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-secondary">{t('attendance.status.present')}</div>
                </div>
                <div className="p-3 bg-muted/5 rounded-lg border border-border/60 text-center">
                  <div className="text-xl font-bold text-destructive">
                    {stat.absent}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-destructive">{t('attendance.status.absent')}</div>
                </div>
              </div>

              <div className="w-full bg-destructive rounded-full h-1.5 overflow-hidden">
                <div className="bg-secondary h-full rounded-full transition-all duration-500" style={{ width: `${stat.presentPercentage}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 flex flex-col items-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">{t('attendance.emptyStates.noData')}</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            {t('attendance.emptyStates.noDataDesc')}
          </p>
        </div>
      )}
    </Card>
  );
};
