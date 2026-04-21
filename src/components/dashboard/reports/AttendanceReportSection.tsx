'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Select from '@/components/Select';
import DraggableScroll from '@/components/DraggableScroll';
import Alert from '@/components/Alert';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import Eye from 'lucide-react/dist/esm/icons/eye';
import FileDown from 'lucide-react/dist/esm/icons/file-down';
import FileSpreadsheet from 'lucide-react/dist/esm/icons/file-spreadsheet';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import X from 'lucide-react/dist/esm/icons/x';
import Users from 'lucide-react/dist/esm/icons/users';
import { useAppStore } from '@/lib/appStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { api } from '@/lib/api';
import { formatDateIST, toISTDate, getISTDateString } from '@/utils/dateUtils';
import { ReportPagination } from './ReportPagination';

export const AttendanceReportSection = () => {
  const t = useTranslations('reports');
  const tCommon = useTranslations('common');

  const { offices, userTypes, users } = useAppStore();
  const { errors, success, handleError, handleSuccess, clearErrors, setSuccess } = useErrorHandler(t);

  const [office, setOffice] = useState('');
  const [userType, setUserType] = useState('');
  const [user, setUser] = useState('');
  const [type, setType] = useState('Monthly Report');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [date, setDate] = useState('');

  const [reportData, setReportData] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      const res = await api.attendance.getAll({
        month, year, office, user, userType
      });
      if (res.ok) return await res.json();
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
  }, [month, year, office, user, userType]);

  const generatePDF = async () => {
    setGenerating(true);
    const attendances = reportData.length > 0 ? reportData : await fetchData();
    if (!attendances?.length) {
      handleError({ message: t('errors.noDataToExport') });
      setGenerating(false);
      return;
    }

    const data = {
      attendances,
      type,
      office: office ? (offices as any).find((o: any) => o._id === office)?.name : 'All',
      userType: userType ? (userTypes as any).find((t: any) => t._id === userType)?.name : 'All',
      user: user ? (users as any).find((u: any) => u._id === user)?.name : 'All',
      period: type === 'Monthly Report' ? (month ? `${month}/${year}` : `All/${year}`) : (date || 'All')
    };

    try {
      const res = await api.pdfs.generateAttendanceReport(data);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = t('export.attendanceFilename');
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

  const exportExcel = async () => {
    setGenerating(true);
    const data = reportData.length > 0 ? reportData : await fetchData();
    if (!data?.length) {
      handleError({ message: t('errors.noDataToExport') });
      setGenerating(false);
      return;
    }

    let csv = `${t('export.attendanceHeaders')}\n`;
    data.forEach((a: any) => {
      const officeName = a.user?.office?.name || '-';
      const userType = a.user?.userType?.name || '-';
      csv += `"${a.user?.name}","${officeName}","${userType}",${formatDateIST(a.date)},${a.status}\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = t('export.csvFilename', { type: 'attendance' });
    a.click();
    window.URL.revokeObjectURL(url);
    handleSuccess(t('success.csvExported'));
    setGenerating(false);
  };

  const pagedData = reportData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <section className='space-y-4 md:space-y-6'>
      <Card className="p-4 md:p-6">
        <div className="flex items-center mb-4 md:mb-6 pb-4 border-b border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{t('attendanceReportTitle')}</h2>
            <p className="text-sm text-muted-foreground">{t('attendanceReportDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <Select
            id="attendance-report-type"
            label={t('filters.reportType')}
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: 'Daily Report', label: t('filters.dailyReport') },
              { value: 'Monthly Report', label: t('filters.monthlyReport') }
            ]}
          />
          {type === 'Daily Report' ? (
            <Input
              id="attendance-daily-date"
              label={t('table.date')}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min="1800-01-01"
              max={new Date().toISOString().split('T')[0]}
            />
          ) : (
            <div className="flex gap-4 md:gap-6">
              <Select
                id="attendance-monthly-month"
                label={t('filters.month')}
                className="flex-1"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: (i + 1).toString(),
                  label: new Date(0, i).toLocaleString('en', { month: 'long' })
                }))}
                placeholder={t('filters.selectMonth')}
              />
              <Input
                id="attendance-monthly-year"
                label={t('filters.year')}
                className="w-24"
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
              />
            </div>
          )}
          <Select
            id="attendance-filter-office"
            label={t('filters.office')}
            value={office}
            onChange={(e) => { setOffice(e.target.value); setUserType(''); setUser(''); }}
            options={offices.map(o => ({ value: o._id, label: o.name }))}
            placeholder={t('filters.allOffices')}
          />
          <Select
            id="attendance-filter-user-type"
            label={t('filters.userType')}
            value={userType}
            onChange={(e) => { setUserType(e.target.value); setUser(''); }}
            options={userTypes.map(ty => ({ value: ty._id, label: ty.name }))}
            placeholder={t('filters.allUserTypes')}
          />
          <Select
            id="attendance-filter-user"
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
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-4" t={t} />}

      {visible && (
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {t('attendanceReportTitle')} {t('generated.results')}
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
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="py-4 px-6 font-semibold text-foreground">{t('table.employee')}</th>
                  <th className="py-4 px-6 font-semibold text-foreground">{t('table.date')}</th>
                  <th className="py-4 px-6 font-semibold text-foreground">{t('table.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {pagedData.map((a: any) => (
                  <tr key={a._id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 font-medium">
                        <Users className="w-4 h-4 text-primary" /> {a.user?.name}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">{formatDateIST(a.date)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${a.status === 'Present' ? 'border border-secondary text-secondary' : a.status === 'Late' ? 'border border-warning text-warning' : 'border border-destructive text-destructive'}`}>
                        {a.status}
                      </span>
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
