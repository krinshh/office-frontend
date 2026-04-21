'use client';

import { useTranslations } from 'next-intl';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import Search from 'lucide-react/dist/esm/icons/search';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import FileSpreadsheet from 'lucide-react/dist/esm/icons/file-spreadsheet';
import FileDown from 'lucide-react/dist/esm/icons/file-down';
import Download from 'lucide-react/dist/esm/icons/download';

interface SalaryFiltersProps {
  offices: any[];
  userTypes: any[];
  users: any[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterOffice: string;
  setFilterOffice: (val: string) => void;
  filterUserType: string;
  setFilterUserType: (val: string) => void;
  filterUser: string;
  setFilterUser: (val: string) => void;
  filterMonth: string;
  setFilterMonth: (val: string) => void;
  filterYear: string;
  setFilterYear: (val: string) => void;
  exportLoading: boolean;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
}

export const SalaryFilters = ({
  offices,
  userTypes,
  users,
  searchTerm,
  setSearchTerm,
  filterOffice,
  setFilterOffice,
  filterUserType,
  setFilterUserType,
  filterUser,
  setFilterUser,
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  exportLoading,
  onExportExcel,
  onExportPDF,
  onExportCSV
}: SalaryFiltersProps) => {
  const t = useTranslations();

  return (
    <div className="mb-4 md:mb-6 space-y-4 md:space-y-6 border-border/60">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-0">
        <div className="flex-shrink-0">
          <Input
            icon={Search}
            iconPosition="left"
            type="text"
            placeholder={t('salary.searchEmployees')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-4 w-full sm:w-auto justify-end">
          <Button
            onClick={onExportExcel}
            disabled={exportLoading}
            variant="outline"
            size="lg"
            className="flex items-center justify-center gap-2 flex-1 sm:flex-none min-w-0"
          >
            {exportLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            <span className="hidden sm:inline">{t('salary.exportExcel')}</span>
            <span className="sm:hidden">Excel</span>
          </Button>
          <Button
            onClick={onExportPDF}
            disabled={exportLoading}
            variant="outline"
            size="lg"
            className="flex items-center justify-center gap-2 flex-1 sm:flex-none min-w-0"
          >
            {exportLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            <span className="hidden sm:inline">{t('salary.exportPDF')}</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          {/* <Button
            onClick={onExportCSV}
            disabled={exportLoading}
            variant="outline"
            size="lg"
            className="flex items-center justify-center gap-2 flex-1 sm:flex-none min-w-0"
          >
            {exportLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">{t('salary.exportCSV')}</span>
            <span className="sm:hidden">CSV</span>
          </Button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Select
          label={t('common.offices')}
          value={filterOffice}
          onChange={(e) => {
            setFilterOffice(e.target.value);
            setFilterUserType('');
            setFilterUser('');
          }}
          options={offices.map((office: any) => ({
            value: office._id,
            label: office.name
          }))}
          placeholder={t('salary.allOffices')}
        />

        <Select
          label={t('common.users')}
          value={filterUserType}
          onChange={(e) => {
            setFilterUserType(e.target.value);
            setFilterUser('');
          }}
          options={userTypes
            .filter((type: any) => !filterOffice || users.some((user: any) => user.office?._id == filterOffice && user.userType?._id == type._id))
            .map((type: any) => ({
              value: type._id,
              label: type.name
            }))}
          placeholder={t('salary.allTypes')}
        />

        <Select
          label={t('salary.employee')}
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          options={users
            .filter((user: any) => (!filterOffice || user.office?._id === filterOffice) && (!filterUserType || user.userType?._id === filterUserType))
            .map((user: any) => ({
              value: user._id,
              label: user.name
            }))}
          placeholder={t('salary.allEmployees')}
        />

        <Select
          label={t('salary.month')}
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          options={Array.from({ length: 12 }, (_, i) => ({
            value: (i + 1).toString(),
            label: new Date(0, i).toLocaleString('en', { month: 'long' })
          }))}
          placeholder={t('salary.allMonths')}
        />

        <Input
          id="salary-filter-year"
          type="number"
          label={t('salary.year')}
          value={filterYear}
          min="1800"
          max={new Date().getFullYear()}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            const currentYear = new Date().getFullYear();
            if (val && parseInt(val) > currentYear) {
              setFilterYear(currentYear.toString());
            } else {
              setFilterYear(val);
            }
          }} 
          placeholder={t('salary.allYears')}
        />
      </div>
    </div>
  );
};
