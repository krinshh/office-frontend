'use client';

import { useTranslations } from 'next-intl';
import { Card, Button, Select } from '@/components';

interface HraSlabTableProps {
  slabs: any[];
  offices: any[];
  userTypes: any[];
  filters: {
    office: string;
    userType: string;
  };
  setFilters: (filters: any) => void;
  editingSlab: any | null;
  setEditingSlab: (slab: any | null) => void;
  onUpdate: (e: any) => void;
  onDelete: (id: string) => void;
  onAddSlab: () => void;
  loading: boolean;
}

export const HraSlabTable = ({
  slabs,
  offices,
  userTypes,
  filters,
  setFilters,
  editingSlab,
  setEditingSlab,
  onUpdate,
  onDelete,
  onAddSlab,
  loading
}: HraSlabTableProps) => {
  const t = useTranslations();

  return (
    <Card className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 pb-4 border-b border-border gap-4">
        <h2 className="text-xl font-bold text-foreground">
          {t('globalConfig.sections.hraSlabManagement')}
        </h2>

        <Button
          onClick={onAddSlab}
          size="sm"
          className="w-full sm:w-auto"
        >
          {t('globalConfig.hraSlab.addNewSlab')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <Select
          aria-label={t('globalConfig.hraSlab.filterByOffice')}
          value={filters.office}
          onChange={(e) => setFilters({ ...filters, office: e.target.value })}
          options={offices.map(o => ({ value: o._id, label: o.name }))}
          placeholder={t('globalConfig.hraSlab.filterByOffice')}
        />
        <Select
          aria-label={t('globalConfig.hraSlab.filterByUserType')}
          value={filters.userType}
          onChange={(e) => setFilters({ ...filters, userType: e.target.value })}
          options={userTypes.map(t => ({ value: t._id, label: t.name }))}
          placeholder={t('globalConfig.hraSlab.filterByUserType')}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left py-4 px-6 font-semibold">{t('globalConfig.hraSlab.office')}</th>
              <th className="text-left py-4 px-6 font-semibold">{t('globalConfig.hraSlab.userType')}</th>
              <th className="text-left py-4 px-6 font-semibold">{t('globalConfig.hraSlab.salaryRange')}</th>
              <th className="text-left py-4 px-6 font-semibold">{t('globalConfig.hraSlab.hraPercent')}</th>
              <th className="text-left py-4 px-6 font-semibold">{t('globalConfig.hraSlab.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {slabs.map((slab) => (
              <tr key={slab._id}>
                <td className="py-4 px-6">{slab.office?.name}</td>
                <td className="py-4 px-6">{slab.userType?.name}</td>
                <td className="py-4 px-6">
                  {editingSlab?._id === slab._id ? (
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={editingSlab.minSalary}
                        onChange={(e) => setEditingSlab({ ...editingSlab, minSalary: parseFloat(e.target.value) || 0 })}
                        className="w-20 p-1 border border-input rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                        aria-label={t('globalConfig.hraSlab.minimumSalary')}
                      />
                      <input
                        type="number"
                        value={editingSlab.maxSalary}
                        onChange={(e) => setEditingSlab({ ...editingSlab, maxSalary: parseFloat(e.target.value) || 0 })}
                        className="w-20 p-1 border border-input rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                        aria-label={t('globalConfig.hraSlab.maximumSalary')}
                      />
                    </div>
                  ) : (
                    `₹${slab.minSalary} - ₹${slab.maxSalary}`
                  )}
                </td>
                <td className="py-4 px-6">
                  {editingSlab?._id === slab._id ? (
                    <input
                      type="number"
                      value={editingSlab.hraPercentage}
                      onChange={(e) => setEditingSlab({ ...editingSlab, hraPercentage: parseFloat(e.target.value) || 0 })}
                      className="w-20 p-1 border border-input rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                      aria-label={t('globalConfig.hraSlab.hraPercent')}
                    />
                  ) : (
                    `${slab.hraPercentage}%`
                  )}
                </td>
                <td className="py-4 px-6">
                  {editingSlab?._id === slab._id ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={onUpdate} loading={loading}>{t('globalConfig.hraSlab.save')}</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingSlab(null)} disabled={loading}>{t('globalConfig.hraSlab.cancel')}</Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setEditingSlab(slab)}>{t('globalConfig.hraSlab.edit')}</Button>
                      <Button size="sm" variant="danger" onClick={() => onDelete(slab._id)}>{t('globalConfig.hraSlab.delete')}</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {slabs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">{t('common.noDataFound')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
