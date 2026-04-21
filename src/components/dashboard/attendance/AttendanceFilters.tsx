'use client';

import { useTranslations } from 'next-intl';
import Card from '@/components/Card';
import Select from '@/components/Select';
import Input from '@/components/Input';
import Filter from 'lucide-react/dist/esm/icons/filter';

interface AttendanceFiltersProps {
  filters: {
    office: string;
    userType: string;
    user: string;
    month: number;
    year: number;
  };
  setFilters: (val: any) => void;
  viewMode: 'overview' | 'monthly';
  officeOptions: { value: string; label: string }[];
  userTypeOptions: { value: string; label: string }[];
  userOptions: { value: string; label: string }[];
}

export const AttendanceFilters = ({
  filters,
  setFilters,
  viewMode,
  officeOptions,
  userTypeOptions,
  userOptions
}: AttendanceFiltersProps) => {
  const t = useTranslations();

  return (
    <Card className="p-4 md:p-6 border-border/60 shadow-sm">
      <div className="flex items-center mb-4 md:mb-6 pb-4 border-b border-border/60">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
          <Filter className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          {t('attendance.filters')}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Select
          label={t('attendance.form.office')}
          value={filters.office}
          onChange={(e) => setFilters((prev: any) => ({ ...prev, office: e.target.value }))}
          options={[{ value: '', label: t('attendance.options.allOffices') }, ...officeOptions]}
        />

        <Select
          label={t('attendance.form.userType')}
          value={filters.userType}
          onChange={(e) => setFilters((prev: any) => ({ ...prev, userType: e.target.value }))}
          options={[{ value: '', label: t('attendance.options.allTypes') }, ...userTypeOptions]}
        />

        {viewMode === 'monthly' && (
          <>
            <Select
              label={t('attendance.form.user')}
              value={filters.user}
              onChange={(e) => setFilters((prev: any) => ({ ...prev, user: e.target.value }))}
              options={[{ value: '', label: t('attendance.options.selectUser') }, ...userOptions]}
            />

            <Input
              type="month"
              label={t('attendance.form.month')}
              value={`${filters.year}-${filters.month.toString().padStart(2, '0')}`}
              onChange={(e) => {
                if (!e.target.value) return;
                const [year, month] = e.target.value.split('-');
                setFilters((prev: any) => ({ ...prev, year: parseInt(year), month: parseInt(month) }));
              }}
            />
          </>
        )}
      </div>
    </Card>
  );
};
