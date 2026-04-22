'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Alert, Card } from '@/components';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useSalaryStore } from '@/lib/salaryStore';
import { useConfigStore } from '@/lib/configStore';
import { useAppStore } from '@/lib/appStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';

import { SalaryGenerator } from './SalaryGenerator';
import { SalaryFilters } from './SalaryFilters';
import { SalaryTable } from './SalaryTable';

export function SalaryClient() {
  const { user } = useAuthStore();
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();

  const {
    errors,
    success,
    loading,
    setLoading,
    handleError,
    handleSuccess,
    clearErrors,
    setSuccess
  } = useErrorHandler(t);

  const [exportLoading, setExportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { hasPermission } = usePermissions();
  const isAdmin = hasPermission(PERMISSIONS.SALARY_VIEW_ALL);

  // Store states
  const { offices, userTypes, users, fetchOffices, fetchUserTypes, fetchUsers } = useAppStore();
  const { fetchConfig, fetchHRASlabs } = useConfigStore();
  const { salaries, fetchSalaries, addMultipleSalaries, isFetching } = useSalaryStore();

  // Generation Form Filters
  const [generateOffice, setGenerateOffice] = useState('');
  const [generateUserType, setGenerateUserType] = useState('');
  const [generateUser, setGenerateUser] = useState('');

  // History filters
  const [filterOffice, setFilterOffice] = useState('');
  const [filterUserType, setFilterUserType] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace(`/${locale}/user/salary`);
    } else if (user) {
      fetchData();
    }
  }, [isAdmin, !!user, locale, router]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchConfig(),
        fetchOffices(),
        fetchUserTypes(),
        fetchHRASlabs(),
        fetchSalaries(false, true),
        fetchUsers(false, { includeInactive: true })
      ]);
    } catch (error) {
      handleError(error, t('salary.failedToFetchData'));
    }
  };

  const generateSalary = async () => {
    clearErrors();
    setLoading(true);
    try {
      const payload: any = {};
      if (generateUser) payload.userId = generateUser;

      const res = await api.salary.generate(payload);
      if (res.ok) {
        const data = await res.json();
        addMultipleSalaries(data.salaries);
        handleSuccess(t('salary.salariesGeneratedSuccess', { count: data.salaries.length }));
      } else {
        const errorData = await res.json().catch(() => ({}));
        handleError(errorData, t('salary.failedToGenerateSalaries'));
      }
    } catch (error) {
      handleError(error, t('salary.failedToGenerateSalaries'));
    } finally {
      setLoading(false);
    }
  };

  const downloadSalarySlip = async (salary: any) => {
    try {
      const res = await api.pdfs.generateSalarySlip({ salary });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `salary-slip-${salary.user?.name}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        handleSuccess(t('salary.pdfDownloadSuccess'));
      } else {
        handleError(null, t('salary.failedToGeneratePDF'));
      }
    } catch (error) {
      handleError(error, t('salary.failedToGeneratePDF'));
    }
  };

  const exportToExcel = () => {
    setExportLoading(true);
    try {
      if (filteredSalaries.length === 0) {
        handleError({ message: t('salary.noDataToExport') });
        return;
      }

      let csv = 'Employee,Office,User Type,Month,Year,Base Salary,Allowances,Bonus,Overtime,ESI,PF,VPF,Income Tax,Cess,Professional Tax,Late Deductions,Absent Deductions,Half Day Deductions,Task Penalties,Total Salary,Payment ID,Status\n';

      filteredSalaries.forEach((salary: any) => {
        csv += `"${salary.user?.name || 'N/A'}","${salary.user?.office?.name || 'N/A'}","${salary.user?.userType?.name || 'N/A'}",${salary.month},${salary.year},${salary.baseSalary},${salary.allowances || 0},${salary.bonus || 0},${salary.overtime || 0},${salary.esi || 0},${salary.pf || 0},${salary.vpf || 0},${salary.incomeTax || 0},${salary.cess || 0},${salary.professionalTax || 0},${salary.lateDeductions || 0},${salary.absentDeductions || 0},${salary.halfDayDeductions || 0},${salary.taskPenalties || 0},${salary.totalSalary},"${salary.razorpayPaymentId || 'N/A'}","Generated"\n`;
      });

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salaries-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      handleSuccess(t('salary.excelExportedSuccess'));
    } catch (error) {
      handleError(error, t('salary.failedToExportExcel'));
    } finally {
      setExportLoading(false);
    }
  };

  const exportToPDF = async () => {
    setExportLoading(true);
    try {
      if (filteredSalaries.length === 0) {
        handleError({ message: t('salary.noDataToExport') });
        return;
      }

      const data = {
        salaries: filteredSalaries,
        filters: {
          office: filterOffice ? offices.find((o: any) => o._id === filterOffice)?.name : 'All',
          userType: filterUserType ? userTypes.find((t: any) => t._id === filterUserType)?.name : 'All',
          user: filterUser ? users.find((u: any) => u._id === filterUser)?.name : 'All',
          month: filterMonth || 'All',
          year: filterYear || 'All',
          search: searchTerm || 'None'
        }
      };

      const res = await api.pdfs.generateSalaryReport(data);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `salary-report-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        handleSuccess(t('salary.pdfExportedSuccess'));
      } else {
        handleError(null, t('salary.failedToExportPDF'));
      }
    } catch (error) {
      handleError(error, t('salary.failedToExportPDF'));
    } finally {
      setExportLoading(false);
    }
  };

  const downloadCSV = async () => {
    setExportLoading(true);
    try {
      const params = filterMonth && filterYear ? { month: filterMonth, year: filterYear } : {};
      const res = await api.salary.downloadCSV(params);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `salaries-${filterMonth && filterYear ? `${filterMonth}-${filterYear}` : 'all'}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        handleSuccess(t('salary.csvExportedSuccess'));
      } else {
        handleError(null, t('salary.failedToExportCSV'));
      }
    } catch (error) {
      handleError(error, t('salary.failedToExportCSV'));
    } finally {
      setExportLoading(false);
    }
  };

  const filteredSalaries = useMemo(() => salaries.filter((salary: any) =>
    (!filterOffice || salary.user?.office?._id === filterOffice) &&
    (!filterUserType || salary.user?.userType?._id === filterUserType) &&
    (!filterUser || salary.user?._id === filterUser) &&
    (!filterMonth || salary.month === parseInt(filterMonth)) &&
    (!filterYear || salary.year === parseInt(filterYear)) &&
    (!searchTerm || salary.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [salaries, filterOffice, filterUserType, filterUser, filterMonth, filterYear, searchTerm]);

  const paginatedSalaries = useMemo(() =>
    filteredSalaries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredSalaries, currentPage]);

  const totalPages = Math.ceil(filteredSalaries.length / itemsPerPage);

  const usersForGenerationOptions = useMemo(() => {
    const now = new Date();
    const prevMonthIndex = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const prevMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const startOfPrevMonth = new Date(prevMonthYear, prevMonthIndex, 1);
    const endOfPrevMonth = new Date(prevMonthYear, prevMonthIndex + 1, 0);

    return users.filter((u: any) => {
      if (u.joiningDate && new Date(u.joiningDate) > endOfPrevMonth) return false;
      if (!u.isActive) {
        if (!u.deactivatedAt) return false;
        if (new Date(u.deactivatedAt) < startOfPrevMonth) return false;
      }
      if (generateOffice && u.office?._id !== generateOffice) return false;
      if (generateUserType && u.userType?._id !== generateUserType) return false;
      return true;
    }).map((user: any) => ({
      value: user._id,
      label: `${user.name} ${user.userType?.name ? `(${user.userType.name})` : ''}`
    }));
  }, [users, generateOffice, generateUserType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterOffice, filterUserType, filterUser, filterMonth, filterYear, searchTerm]);

  if (!isAdmin) return null;

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-none pb-1">{t('salary.title')}</h1>
          <p className="text-muted-foreground leading-none pb-1">{t('salary.subtitle')}</p>
        </div>
      </div>

      {errors.general && <Alert type="error" message={errors.general} onClose={() => clearErrors()} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <SalaryGenerator
        offices={offices}
        userTypes={userTypes}
        generateOffice={generateOffice}
        setGenerateOffice={setGenerateOffice}
        generateUserType={generateUserType}
        setGenerateUserType={setGenerateUserType}
        generateUser={generateUser}
        setGenerateUser={setGenerateUser}
        usersOptions={usersForGenerationOptions}
        onGenerate={generateSalary}
        loading={loading}
        hasPermission={hasPermission}
      />

      <Card className="p-4 md:p-6 border-border/60 shadow-sm overflow-hidden">
        <div className="flex flex-col space-y-4 mb-4 md:mb-6 pb-4 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold text-foreground leading-none pb-1">{t('salary.title')}</h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-none pb-1">{t('salary.subtitle')}</p>
              </div>
            </div>
          </div>
        </div>

        <SalaryFilters
          offices={offices}
          userTypes={userTypes}
          users={users}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterOffice={filterOffice}
          setFilterOffice={setFilterOffice}
          filterUserType={filterUserType}
          setFilterUserType={setFilterUserType}
          filterUser={filterUser}
          setFilterUser={setFilterUser}
          filterMonth={filterMonth}
          setFilterMonth={setFilterMonth}
          filterYear={filterYear}
          setFilterYear={setFilterYear}
          exportLoading={exportLoading}
          onExportExcel={exportToExcel}
          onExportPDF={exportToPDF}
          onExportCSV={downloadCSV}
        />

        <SalaryTable
          paginatedSalaries={paginatedSalaries}
          totalRecords={filteredSalaries.length}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onDownloadSlip={downloadSalarySlip}
          isLoading={isFetching}
        />
      </Card>
    </div>
  );
}
