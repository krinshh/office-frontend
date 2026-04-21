'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Select from '@/components/Select';
import DraggableScroll from '@/components/DraggableScroll';
import Alert from '@/components/Alert';
import IndianRupee from 'lucide-react/dist/esm/icons/indian-rupee';
import Eye from 'lucide-react/dist/esm/icons/eye';
import Download from 'lucide-react/dist/esm/icons/download';
import FileDown from 'lucide-react/dist/esm/icons/file-down';
import FileSpreadsheet from 'lucide-react/dist/esm/icons/file-spreadsheet';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import X from 'lucide-react/dist/esm/icons/x';
import { useAppStore } from '@/lib/appStore';
import { useSalaryStore } from '@/lib/salaryStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { api } from '@/lib/api';
import { ReportPagination } from './ReportPagination';

export const SalaryReportSection = () => {
  const t = useTranslations('reports');

  const { offices, userTypes, users } = useAppStore();
  const { salaries, fetchSalaries } = useSalaryStore();
  const { errors, success, handleError, handleSuccess, clearErrors } = useErrorHandler(t);

  const [office, setOffice] = useState('');
  const [userType, setUserType] = useState('');
  const [user, setUser] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const [reportData, setReportData] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      const res = await api.salary.getAllSalaries();
      if (res.ok) {
        let data = await res.json();
        // Filter data locally as per previous implementation logic
        if (office) data = data.filter((s: any) => s.user?.office?._id === office);
        if (userType) data = data.filter((s: any) => s.user?.userType?._id === userType);
        if (user) data = data.filter((s: any) => s.user?._id === user);
        if (month) data = data.filter((s: any) => s.month === parseInt(month));
        if (year) data = data.filter((s: any) => s.year === parseInt(year));
        return data;
      }
      return [];
    } catch (err) {
      handleError(err, t('errors.failedToFetchData'));
      return [];
    }
  };

  const generateReport = async (quiet = false) => {
    setVisible(false);
    setGenerating(true);
    const data = await fetchData();
    if (data && data.length > 0) {
      setReportData(data);
      setVisible(true);
      setPage(1);
      if (!quiet) handleSuccess(t('success.reportGenerated'));
    } else if (!quiet) {
      handleError({ message: t('errors.noDataToExport') });
    }
    setGenerating(false);
  };

  useEffect(() => {
    const handler = () => generateReport(true);
    window.addEventListener('generate-all-reports', handler);
    return () => window.removeEventListener('generate-all-reports', handler);
  }, [office, userType, user, month, year]);

  const generatePDF = async () => {
    setGenerating(true);
    const salaryDataArr = reportData.length > 0 ? reportData : await fetchData();
    if (!salaryDataArr?.length) {
      handleError({ message: t('errors.noDataToExport') });
      setGenerating(false);
      return;
    }

    const data = {
      salaries: salaryDataArr,
      type: 'All Staff',
      month,
      year,
      office: office ? offices.find(o => o._id === office)?.name : 'All',
      userType: userType ? userTypes.find(ty => ty._id === userType)?.name : 'All',
      user: user ? users.find(u => u._id === user)?.name : 'All'
    };

    try {
      const res = await api.pdfs.generateSalaryReport(data);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'salary-report.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        handleSuccess(t('success.pdfGenerated'));
      }
    } catch (err) {
      handleError(err, t('errors.failedToGeneratePDF'));
    } finally {
      setGenerating(false);
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
        handleSuccess(t('success.pdfGenerated'));
      }
    } catch (err) {
      handleError(err, t('errors.failedToGeneratePDF'));
    }
  };

  const exportExcel = async () => {
    setGenerating(true);
    const data = reportData.length > 0 ? reportData : await fetchData();
    if (!data?.length) {
      handleError({ message: t('errors.noDataToExport') });
      setGenerating(false);
      return;
    }

    let csv = `${t('export.salaryHeaders')}\n`;
    data.forEach((s: any) => {
      csv += `${s.user?.name},${s.user?.office?.name},${s.user?.userType?.name},${new Date(0, s.month - 1).toLocaleString('en', { month: 'long' })},${s.year},${s.razorpayPaymentId || ''},${s.totalSalary}\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = t('export.csvFilename', { type: 'salary' });
    a.click();
    window.URL.revokeObjectURL(url);
    handleSuccess(t('success.csvExported'));
    setGenerating(false);
  };

  const pagedData = reportData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <section className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6">
        <div className="flex items-center mb-4 md:mb-6 pb-4 border-b border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <IndianRupee className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{t('salaryReportTitle')}</h2>
            <p className="text-sm text-muted-foreground">{t('salaryReportDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <Select
            id="salary-filter-month"
            label={t('filters.month')}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            options={Array.from({ length: 12 }, (_, i) => ({
              value: (i + 1).toString(),
              label: new Date(0, i).toLocaleString('en', { month: 'long' })
            }))}
            placeholder={t('filters.selectMonth')}
          />
          <Input
            id="salary-filter-year"
            label={t('filters.year')}
            type="number"
            value={year}
            min="1800"
            max={new Date().getFullYear()}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              const currentYear = new Date().getFullYear();
              if (val && parseInt(val) > currentYear) {
                setYear(currentYear.toString());
              } else {
                setYear(val);
              }
            }}
            placeholder="2024"
          />
          <Select
            id="salary-filter-office"
            label={t('filters.office')}
            value={office}
            onChange={(e) => { setOffice(e.target.value); setUserType(''); setUser(''); }}
            options={offices.map(o => ({ value: o._id, label: o.name }))}
            placeholder={t('filters.allOffices')}
          />
          <Select
            id="salary-filter-user-type"
            label={t('filters.userType')}
            value={userType}
            onChange={(e) => { setUserType(e.target.value); setUser(''); }}
            options={userTypes.map(ty => ({ value: ty._id, label: ty.name }))}
            placeholder={t('filters.allUserTypes')}
          />
          <Select
            id="salary-filter-user"
            label={t('filters.employee')}
            value={user}
            onChange={(e) => setUser(e.target.value)}
            options={users.filter(u => (!office || u.office?._id === office) && (!userType || u.userType?._id === userType)).map(u => ({ value: u._id, label: u.name }))}
            placeholder={t('filters.allUsers')}
          />
        </div>

        <div className="flex flex-wrap gap-4 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border/50">
          <Button onClick={() => generateReport()} disabled={generating} className="w-full sm:w-auto">
            {generating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {t('buttons.generate')}
          </Button>
          <Button variant="outline" onClick={generatePDF} disabled={generating} className="w-full sm:w-auto">
            <FileDown className="w-4 h-4 mr-2" /> {t('buttons.generatePDF')}
          </Button>
          <Button variant="outline" onClick={exportExcel} disabled={generating} className="w-full sm:w-auto">
            <FileSpreadsheet className="w-4 h-4 mr-2" /> {t('buttons.exportExcel')}
          </Button>
        </div>
      </Card>

      {errors.general && <Alert type="error" message={errors.general} onClose={() => clearErrors()} className="mb-4" t={t} />}
      {success && <Alert type="success" message={success} onClose={() => { }} className="mb-4" t={t} />}

      {visible && (
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {t('salaryReportTitle')} {t('generated.results')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVisible(false)}
              className="hover:bg-destructive/10 hover:text-destructive"
              aria-label={t('buttons.removeReport')}
            >
              <X className="w-4 h-4 mr-2" /> {t('buttons.removeReport')}
            </Button>
          </div>

          <DraggableScroll className="rounded-xl border border-border">
            <table className="w-full text-left text-sm min-w-[1000px]">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="py-4 px-6 font-semibold text-foreground">{t('table.employee')}</th>
                  <th className="py-4 px-6 font-semibold text-foreground">{t('table.month')}</th>
                  <th className="py-4 px-6 font-semibold text-foreground">{t('table.year')}</th>
                  <th className="py-4 px-6 font-semibold text-foreground">{t('table.netSalary')}</th>
                  <th className="py-4 px-6 font-semibold text-center">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {pagedData.map((s: any) => (
                  <tr key={s._id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-foreground">{s.user?.name}</td>
                    <td className="py-4 px-6 text-muted-foreground">{new Date(0, s.month - 1).toLocaleString('en', { month: 'long' })}</td>
                    <td className="py-4 px-6 text-muted-foreground">{s.year}</td>
                    <td className="py-4 px-6 text-secondary font-medium">₹{s.totalSalary.toLocaleString()}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => window.open(`/dashboard/reports/slip/${s._id}`, '_blank')} className="h-8">
                          <Eye className="w-3.5 h-3.5 mr-1" /> {t('actions.view')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => downloadSalarySlip(s)} className="h-8">
                          <Download className="w-3.5 h-3.5 mr-1" /> {t('actions.download')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DraggableScroll>
          <ReportPagination totalItems={reportData.length} itemsPerPage={itemsPerPage} currentPage={page} onPageChange={setPage} />
        </Card>
      )}
    </section>
  );
};
