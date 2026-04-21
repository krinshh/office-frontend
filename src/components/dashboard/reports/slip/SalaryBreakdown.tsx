'use client';

import { Button } from '@/components';

interface SalaryBreakdownProps {
  salary: any;
  t: any;
  downloadSlip: () => void;
}

export function SalaryBreakdown({ salary, t, downloadSlip }: SalaryBreakdownProps) {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 md:mb-6">{t('salarySlip.salaryBreakdown')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Earnings */}
          <div className="p-4 rounded-xl border border-secondary/50 bg-secondary/30">
            <h4 className="text-sm font-bold text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              {t('salarySlip.earnings')}
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-secondary/50 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.baseSalary')}</span>
                <span className="text-foreground font-bold">₹{salary.baseSalary?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-secondary/50 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.ta')}</span>
                <span className="text-foreground font-bold">₹{salary.ta?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-secondary/50 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.sa')}</span>
                <span className="text-foreground font-bold">₹{salary.sa?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-secondary/50 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.da')}</span>
                <span className="text-foreground font-bold">₹{salary.da?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-secondary/50 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.hra')}</span>
                <span className="text-foreground font-bold">₹{salary.hra?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-secondary/50 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.cca')}</span>
                <span className="text-foreground font-bold">₹{salary.cca?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-secondary/50 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.bonus')}</span>
                <span className="text-foreground font-bold">₹{(salary.performanceBonus || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.overtime')}</span>
                <span className="text-foreground font-bold">₹{salary.overtimePay?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="p-4 rounded-xl border border-destructive/50 bg-destructive/30">
            <h4 className="text-sm font-bold text-destructive uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive"></span>
              {t('salarySlip.deductions')}
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-destructive/50 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.pf')}</span>
                <span className="text-foreground font-bold">-₹{salary.pf?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-destructive/50 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.esi')}</span>
                <span className="text-foreground font-bold">-₹{salary.esi?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-destructive/50 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.vpf')}</span>
                <span className="text-foreground font-bold">-₹{salary.vpf?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-destructive/50 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.incomeTax')}</span>
                <span className="text-foreground font-bold">-₹{salary.incomeTax?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-destructive/50 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.cess')}</span>
                <span className="text-foreground font-bold">-₹{salary.cess?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-destructive/50 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.professionalTax')}</span>
                <span className="text-foreground font-bold">-₹{salary.professionalTax?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-destructive/50 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.lateDeductions')}</span>
                <span className="text-foreground font-bold">-₹{salary.lateDeductions?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-destructive/50 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.absentDeductions')}</span>
                <span className="text-foreground font-bold">-₹{salary.absentDeductions?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-destructive/50 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.halfDayDeductions')}</span>
                <span className="text-foreground font-bold">-₹{salary.halfDayDeductions?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 last:border-0">
                <span className="text-muted-foreground font-medium text-sm">{t('salarySlip.taskPenalties')}</span>
                <span className="text-foreground font-bold">-₹0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Total */}
      <div className="border-t font-semibold border-border flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-6 bg-muted/20 -mx-4 md:-mx-6 -mb-4 md:-mb-6 p-4 md:p-6">
        <div className="text-sm text-muted-foreground max-w-sm text-left">
          {t('salarySlip.footerNote')}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-4 w-full lg:w-auto">
          <div className="text-left lg:text-right w-full sm:w-auto">
            <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">{t('salarySlip.netSalary')}</div>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">₹{salary.totalSalary?.toLocaleString()}</div>
          </div>
          <Button onClick={downloadSlip} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 h-12 px-8 rounded-xl font-bold text-base transition-all duration-300">
            {t('salarySlip.downloadSlip')}
          </Button>
        </div>
      </div>
    </div>
  );
}
