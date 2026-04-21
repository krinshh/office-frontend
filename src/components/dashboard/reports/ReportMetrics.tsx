'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components';
import Users from 'lucide-react/dist/esm/icons/users';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import CheckSquare from 'lucide-react/dist/esm/icons/check-square';
import IndianRupee from 'lucide-react/dist/esm/icons/indian-rupee';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';

interface MetricsProps {
  metrics: {
    totalEmployees: number;
    presentToday: number;
    tasksCompleted: number;
    salariesProcessed: number;
    totalAttendance: number;
    absentToday: number;
    totalTasks: number;
    totalSalaries: number;
  };
  permissions: {
    userAccess: boolean;
    attendanceAccess: boolean;
    taskAccess: boolean;
    salaryAccess: boolean;
  };
}

export const ReportMetrics = ({ metrics, permissions }: MetricsProps) => {
  const t = useTranslations('reports');

  const metricCards = [
    {
      id: 'totalEmployees',
      label: t('metrics.totalEmployees'),
      value: metrics.totalEmployees,
      icon: Users,
      color: 'border-primary',
      iconColor: 'text-primary',
      show: permissions.userAccess
    },
    {
      id: 'presentToday',
      label: t('metrics.presentToday'),
      value: metrics.presentToday,
      icon: Calendar,
      color: 'border-primary',
      iconColor: 'text-primary',
      show: permissions.attendanceAccess
    },
    {
      id: 'tasksCompleted',
      label: t('metrics.tasksCompleted'),
      value: metrics.tasksCompleted,
      icon: CheckSquare,
      color: 'border-primary',
      iconColor: 'text-primary',
      show: permissions.taskAccess
    },
    {
      id: 'salariesProcessed',
      label: t('metrics.salariesProcessed'),
      value: metrics.salariesProcessed,
      icon: IndianRupee,
      color: 'border-primary',
      iconColor: 'text-primary',
      show: permissions.salaryAccess
    },
    {
      id: 'totalAttendance',
      label: t('metrics.totalAttendance'),
      value: metrics.totalAttendance,
      icon: BarChart3,
      color: 'border-primary',
      iconColor: 'text-primary',
      show: permissions.attendanceAccess
    },
    {
      id: 'absentToday',
      label: t('metrics.absentToday'),
      value: metrics.absentToday,
      icon: Calendar,
      color: 'border-primary',
      iconColor: 'text-primary',
      show: permissions.attendanceAccess
    },
    {
      id: 'totalTasks',
      label: t('metrics.totalTasks'),
      value: metrics.totalTasks,
      icon: FileText,
      color: 'border-primary',
      iconColor: 'text-primary',
      show: permissions.taskAccess
    },
    {
      id: 'totalSalaries',
      label: t('metrics.totalSalaries'),
      value: metrics.totalSalaries,
      icon: TrendingUp,
      color: 'border-primary',
      iconColor: 'text-primary',
      show: permissions.salaryAccess
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4 md:mb-6 lg:mb-8">
      {metricCards.filter(card => card.show).map((card) => (
        <Card key={card.id} className={`p-4 border-l-4 ${card.color}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
            </div>
            <card.icon className={`w-8 h-8 ${card.iconColor}`} />
          </div>
        </Card>
      ))}
    </div>
  );
};
