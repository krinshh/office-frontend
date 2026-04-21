'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Select from '@/components/Select';
import DraggableScroll from '@/components/DraggableScroll';
import Alert from '@/components/Alert';
import CheckSquare from 'lucide-react/dist/esm/icons/check-square';
import Eye from 'lucide-react/dist/esm/icons/eye';
import FileDown from 'lucide-react/dist/esm/icons/file-down';
import FileSpreadsheet from 'lucide-react/dist/esm/icons/file-spreadsheet';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import X from 'lucide-react/dist/esm/icons/x';
import { useAppStore } from '@/lib/appStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { api } from '@/lib/api';
import { formatDateIST } from '@/utils/dateUtils';
import { ReportPagination } from './ReportPagination';

export const TaskReportSection = () => {
  const t = useTranslations('reports');

  const { offices, userTypes, users } = useAppStore();
  const { errors, success, handleError, handleSuccess, clearErrors } = useErrorHandler(t);

  const [office, setOffice] = useState('');
  const [userType, setUserType] = useState('');
  const [user, setUser] = useState('');
  const [period, setPeriod] = useState('This Month');
  const [dateMode, setDateMode] = useState<'createdAt' | 'completedAt'>('createdAt');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [reportData, setReportData] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      const params: any = { office, userType, user };
      const now = new Date();
      if (period === 'Custom Range') {
        params.startDate = startDate;
        params.endDate = endDate;
        params.dateField = dateMode;
      } else if (period === 'This Month' || period === 'This Week') {
        params.month = (now.getMonth() + 1).toString();
        params.year = now.getFullYear().toString();
      } else if (period === 'Last Month') {
        const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        params.month = (last.getMonth() + 1).toString();
        params.year = last.getFullYear().toString();
      }

      const res = await api.tasks.getAssignments(params);
      if (res.ok) {
        let data = await res.json();
        if (period === 'This Week') {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          data = data.filter((t: any) => new Date(t.createdAt) >= weekStart);
        }
        return data;
      }
      return [];
    } catch (err) {
      handleError(err, t('errors.failedToFetchData'));
      return [];
    }
  };

  const generateReport = async (quiet = false) => {
    if (!quiet && period === 'Custom Range' && startDate && endDate && new Date(startDate) > new Date(endDate)) {
      handleError({ message: t('errors.invalidDateRange') || 'Start date cannot be later than end date' });
      return;
    }

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
  }, [office, userType, user, period, startDate, endDate, dateMode]);

  const generatePDF = async () => {
    if (period === 'Custom Range' && startDate && endDate && new Date(startDate) > new Date(endDate)) {
      handleError({ message: t('errors.invalidDateRange') });
      setGenerating(false);
      return;
    }

    const tasks = reportData.length > 0 ? reportData : await fetchData();
    if (!tasks?.length) {
      handleError({ message: t('errors.noDataToExport') });
      setGenerating(false);
      return;
    }

    const data = {
      tasks,
      period,
      office: office ? offices.find(o => o._id === office)?.name : 'All',
      userType: userType ? userTypes.find(ty => ty._id === userType)?.name : 'All',
      user: user ? users.find(u => u._id === user)?.name : 'All'
    };

    try {
      const res = await api.pdfs.generateTaskReport(data);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = t('export.taskFilename');
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
    if (period === 'Custom Range' && startDate && endDate && new Date(startDate) > new Date(endDate)) {
      handleError({ message: t('errors.invalidDateRange') });
      return;
    }

    setGenerating(true);
    const data = reportData.length > 0 ? reportData : await fetchData();
    if (!data?.length) {
      handleError({ message: t('errors.noDataToExport') });
      setGenerating(false);
      return;
    }

    let csv = `${t('export.taskHeaders')}\n`;
    data.forEach((task: any) => {
      const assignees = Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []);
      const assigneeNames = assignees.map((u: any) => u?.name).filter(Boolean).join('; ');

      const officeNames = [...new Set(assignees.map((u: any) => u?.office?.name).filter(Boolean))].join('; ');
      const userTypeNames = [...new Set(assignees.map((u: any) => u?.userType?.name).filter(Boolean))].join('; ');

      csv += `"${task.task?.name || '-'}","${officeNames || '-'}","${userTypeNames || '-'}","${assigneeNames || '-'}","${task.assignedBy?.name || '-'}","${task.status}",${formatDateIST(task.createdAt)},${task.completedAt ? formatDateIST(task.completedAt) : '-'},"${task.remarks || '-'}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = t('export.csvFilename', { type: 'task' });
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
            <CheckSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{t('taskReportTitle')}</h2>
            <p className="text-sm text-muted-foreground">{t('taskReportDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <Select
            id="task-filter-period"
            label={t('filters.reportType')}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: 'This Week', label: t('filters.thisWeek') },
              { value: 'This Month', label: t('filters.thisMonth') },
              { value: 'Last Month', label: t('filters.lastMonth') },
              { value: 'Custom Range', label: t('filters.customRange') }
            ]}
          />
          <Select
            id="task-filter-office"
            label={t('filters.office')}
            value={office}
            onChange={(e) => { setOffice(e.target.value); setUserType(''); setUser(''); }}
            options={offices.map(o => ({ value: o._id, label: o.name }))}
            placeholder={t('filters.allOffices')}
          />
          <Select
            id="task-filter-user-type"
            label={t('filters.userType')}
            value={userType}
            onChange={(e) => { setUserType(e.target.value); setUser(''); }}
            options={userTypes.map(ty => ({ value: ty._id, label: ty.name }))}
            placeholder={t('filters.allUserTypes')}
          />
          <Select
            id="task-filter-user"
            label={t('filters.employee')}
            value={user}
            onChange={(e) => setUser(e.target.value)}
            options={users.filter(u => (!office || u.office?._id === office) && (!userType || u.userType?._id === userType)).map(u => ({ value: u._id, label: u.name }))}
            placeholder={t('filters.allUsers')}
          />
        </div>

        {period === 'Custom Range' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-4 pt-4 border-t border-border/30">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} label={t('filters.startDate')} min="1800-01-01" max={new Date().toISOString().split('T')[0]} />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} label={t('filters.endDate')} min="1800-01-01" max={new Date().toISOString().split('T')[0]} />
            <Select
              value={dateMode}
              onChange={(e) => setDateMode(e.target.value as any)}
              options={[
                { value: 'createdAt', label: t('filters.filterAssigned') },
                { value: 'completedAt', label: t('filters.filterCompleted') }
              ]}
              label={t('filters.dateMode')}
            />
          </div>
        )}

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
              {t('taskReportTitle')} {t('generated.results')}
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
                  <th className="py-4 px-6 font-semibold text-foreground">{t('table.taskName')}</th>
                  <th className="py-4 px-6 font-semibold text-foreground">{t('table.assignedUser')}</th>
                  <th className="py-4 px-6 font-semibold text-foreground">{t('table.assignedDate')}</th>
                  <th className="py-4 px-6 font-semibold text-foreground">{t('table.completionDate')}</th>
                  <th className="py-4 px-6 font-semibold text-foreground">{t('table.workStatus')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {pagedData.map((task: any) => (
                  <tr key={task._id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-foreground">{task.task?.name}</td>
                    <td className="py-4 px-6 text-muted-foreground">
                      {Array.isArray(task.assignedTo) ? task.assignedTo.map((u: any) => u?.name).join(', ') : (task.assignedTo?.name || '-')}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">{formatDateIST(task.createdAt)}</td>
                    <td className="py-4 px-6 text-muted-foreground">{task.completedAt ? formatDateIST(task.completedAt) : '-'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${task.status === 'Completed' ? 'border border-secondary text-secondary' : task.status === 'In Progress' ? 'border border-primary text-primary' : 'border border-warning text-warning'}`}>
                        {task.status}
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
