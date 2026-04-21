'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components';
import Users from 'lucide-react/dist/esm/icons/users';
import Clock from 'lucide-react/dist/esm/icons/clock';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';

interface AttendanceSummaryProps {
  totalEmployees: number;
  totalPresent: number;
  totalAbsent: number;
}

export const AttendanceSummary = ({
  totalEmployees,
  totalPresent,
  totalAbsent
}: AttendanceSummaryProps) => {
  const t = useTranslations();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
      <Card className="p-6 border-l-4 border-l-primary hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('attendance.summary.totalEmployees')}</p>
            <div className="text-3xl font-bold text-foreground mt-2">{totalEmployees}</div>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl">
            <Users className="w-8 h-8 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-primary hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('attendance.summary.presentToday')}</p>
            <div className="text-3xl font-bold text-foreground mt-2">{totalPresent}</div>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl">
            <Clock className="w-8 h-8 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-primary hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('attendance.summary.absentToday')}</p>
            <div className="text-3xl font-bold text-foreground mt-2">{totalAbsent}</div>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </div>
      </Card>
    </div>
  );
};
