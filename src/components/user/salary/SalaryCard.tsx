'use client';

import { Card, Button } from '@/components';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import { useLocale } from 'next-intl';

interface SalaryCardProps {
  salary: any;
  title: string;
  t: any;
  isCurrent?: boolean;
  downloadPDF: (salary: any) => void;
}

export function SalaryCard({ salary, title, t, isCurrent, downloadPDF }: SalaryCardProps) {
  const locale = useLocale();

  const displayTitle = isCurrent
    ? (salary ? t('salary.currentMonthSalary') : t('salary.expectedSalary'))
    : (salary ? new Date(salary.year, salary.month - 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' }) + ' Salary' : title);

  return (
    <Card className="p-4 md:p-6 lg:p-8 border-border/60 shadow-sm">
      <div className="flex items-center mb-4 md:mb-6 lg:mb-8 pb-4 border-b border-border/60">
        {isCurrent ? (
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <BarChart3 className="w-6 h-6 text-secondary" />
          </div>
        ) : (
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <Calendar className="w-6 h-6 text-secondary" />
          </div>
        )}
        <h2 className="text-lg xs:text-xl font-semibold text-foreground">
          {displayTitle}
        </h2>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.baseSalary')}</span>
          <span className="text-secondary font-medium">₹{salary.baseSalary}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.ta')}</span>
          <span className="text-secondary font-medium">+₹{salary.allowances ?? salary.ta ?? 0}</span>
        </div>
        {!isCurrent && (
          <>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">{t('salary.sa')}</span>
              <span className="text-secondary font-medium">+₹{salary.sa || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">{t('salary.da')}</span>
              <span className="text-secondary font-medium">+₹{salary.da || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">{t('salary.hra')}</span>
              <span className="text-secondary font-medium">+₹{salary.hra || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">{t('salary.cca')}</span>
              <span className="text-secondary font-medium">+₹{salary.cca || 0}</span>
            </div>
          </>
        )}
        {isCurrent && (
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">{t('salary.allowances')}</span>
            <span className="text-secondary font-medium">+₹{salary.allowances}</span>
          </div>
        )}
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.bonus')}</span>
          <span className="text-secondary font-medium">+₹{salary.bonus ?? 0}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.overtime')}</span>
          <span className="text-secondary font-medium">+₹{salary.overtime ?? salary.overtimePay ?? 0}</span>
        </div>
        {!isCurrent && (
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">{t('salary.esi')}</span>
            <span className="text-destructive font-medium">-₹{salary.esi || 0}</span>
          </div>
        )}
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.pf')}</span>
          <span className="text-destructive font-medium">-₹{salary.pf}</span>
        </div>
        {!isCurrent && (
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">{t('salary.vpf')}</span>
            <span className="text-destructive font-medium">-₹{salary.vpf || 0}</span>
          </div>
        )}
        {!isCurrent && (
          <>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">{t('salary.incomeTax')}</span>
              <span className="text-destructive font-medium">-₹{salary.incomeTax || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">{t('salary.cess')}</span>
              <span className="text-destructive font-medium">-₹{salary.cess || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">{t('salary.professionalTax')}</span>
              <span className="text-destructive font-medium">-₹{salary.professionalTax || 0}</span>
            </div>
          </>
        )}
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.lateDeductions')}</span>
          <span className="text-destructive font-medium">-₹{salary.lateDeductions}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.absentDeductions')}</span>
          <span className="text-destructive font-medium">-₹{salary.absentDeductions}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.halfDayDeductions')}</span>
          <span className="text-destructive font-medium">-₹{salary.halfDayDeductions}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.taskPenalties')}</span>
          <span className="text-destructive font-medium">-₹{salary.taskPenalties ?? 0}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-t border-border pt-3">
          <span className="text-foreground font-semibold">{t('salary.netSalary')}</span>
          <span className="text-secondary font-bold text-lg">₹{salary.totalSalary}</span>
        </div>
      </div>
      <Button
        variant="secondary"
        onClick={() => downloadPDF(salary)}
        className="w-full mt-6 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {t('salary.downloadSalarySlip')}
      </Button>
    </Card>
  );
}
