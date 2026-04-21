'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Filter from 'lucide-react/dist/esm/icons/filter';

interface AuditFiltersProps {
  filters: {
    user: string;
    action: string;
    resource: string;
    startDate: string;
    endDate: string;
    limit: number;
  };
  onFilterChange: (key: string, value: string) => void;
}

export const AuditFilters = ({ filters, onFilterChange }: AuditFiltersProps) => {
  const t = useTranslations('audit');

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center mb-4 md:mb-6 pb-4 border-b border-border">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
          <Filter className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {t('filters')}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Input
          label={t('user')}
          value={filters.user}
          onChange={(e) => onFilterChange('user', e.target.value)}
          placeholder={t('userPlaceholder')}
        />

        <Select
          label={t('action')}
          value={filters.action}
          onChange={(e) => onFilterChange('action', e.target.value)}
          options={[
            { value: '', label: t('allActions') },
            { value: 'login', label: t('login') },
            { value: 'mark_in', label: t('markIn') },
            { value: 'mark_out', label: t('markOut') },
            { value: 'generate_salary', label: t('generateSalary') },
            { value: 'update_global_config', label: t('updateGlobalConfig') },
            { value: 'create_hra_slab', label: t('createHRASlab') },
            { value: 'update_hra_slab', label: t('updateHRASlab') },
            { value: 'delete_hra_slab', label: t('deleteHRASlab') },
          ]}
        />

        <Select
          label={t('resource')}
          value={filters.resource}
          onChange={(e) => onFilterChange('resource', e.target.value)}
          options={[
            { value: '', label: t('allResources') },
            { value: 'auth', label: t('authentication') },
            { value: 'attendance', label: t('attendance') },
            { value: 'salary', label: t('salary') },
          ]}
        />

        <Input
          label={t('startDate')}
          type="date"
          value={filters.startDate}
          onChange={(e) => onFilterChange('startDate', e.target.value)}
          min="1800-01-01"
          max={new Date().toISOString().split('T')[0]}
        />

        <Input
          label={t('endDate')}
          type="date"
          value={filters.endDate}
          onChange={(e) => onFilterChange('endDate', e.target.value)}
          min="1800-01-01"
          max={new Date().toISOString().split('T')[0]}
        />

        <Select
          label={t('limit')}
          value={filters.limit.toString()}
          onChange={(e) => onFilterChange('limit', e.target.value)}
          options={[
            { value: '25', label: '25' },
            { value: '50', label: '50' },
            { value: '100', label: '100' },
          ]}
        />
      </div>
    </Card>
  );
};
