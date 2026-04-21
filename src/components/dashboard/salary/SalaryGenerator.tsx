'use client';

import { useTranslations } from 'next-intl';
import Card from '@/components/Card';
import Select from '@/components/Select';
import Button from '@/components/Button';
import { PERMISSIONS, PermissionValue } from '@/constants/permissions';
import Plus from 'lucide-react/dist/esm/icons/plus';

interface SalaryGeneratorProps {
  offices: any[];
  userTypes: any[];
  generateOffice: string;
  setGenerateOffice: (val: string) => void;
  generateUserType: string;
  setGenerateUserType: (val: string) => void;
  generateUser: string;
  setGenerateUser: (val: string) => void;
  usersOptions: { value: string; label: string }[];
  onGenerate: () => void;
  loading: boolean;
  hasPermission: (perm: PermissionValue) => boolean;
}

export const SalaryGenerator = ({
  offices,
  userTypes,
  generateOffice,
  setGenerateOffice,
  generateUserType,
  setGenerateUserType,
  generateUser,
  setGenerateUser,
  usersOptions,
  onGenerate,
  loading,
  hasPermission
}: SalaryGeneratorProps) => {
  const t = useTranslations();

  return (
    <Card className="p-4 md:p-6 border-border/60 shadow-sm">
      <div className="flex items-center mb-4 md:mb-6 pb-4 border-b border-border/60">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
          <Plus className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">{t('salary.generateSalary')}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <Select
          label={t('common.offices')}
          value={generateOffice}
          onChange={(e) => {
            setGenerateOffice(e.target.value);
            setGenerateUser('');
          }}
          options={offices.map((office: any) => ({
            value: office._id,
            label: office.name
          }))}
          placeholder={t('salary.allOffices')}
        />
        <Select
          label={t('common.users')}
          value={generateUserType}
          onChange={(e) => {
            setGenerateUserType(e.target.value);
            setGenerateUser('');
          }}
          options={userTypes.map((type: any) => ({
            value: type._id,
            label: type.name
          }))}
          placeholder={t('salary.allTypes')}
        />

        <Select
          label={t('salary.employee')}
          value={generateUser}
          onChange={(e) => setGenerateUser(e.target.value)}
          options={usersOptions}
          placeholder={t('salary.allEmployees')}
        />
      </div>
      <div className="p-4 rounded-lg text-sm text-foreground bg-card border border-border mb-4 md:mb-6">
        <p>{t('salary.generateSalaryNote')}</p>
      </div>
      <Button
        type="button"
        onClick={onGenerate}
        disabled={loading || !hasPermission(PERMISSIONS.SALARY_GENERATE)}
        className="mx-auto w-full max-w-full text-center"
      >
        {loading ? t('salary.generating') : t('salary.generateSalariesForAllUsers')}
      </Button>
    </Card>
  );
};
