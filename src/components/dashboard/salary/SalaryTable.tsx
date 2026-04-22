'use client';

import { useTranslations, useLocale } from 'next-intl';
import Button from '@/components/Button';
import DraggableScroll from '@/components/DraggableScroll';
import Link from '@/components/Link';
import Users from 'lucide-react/dist/esm/icons/users';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Eye from 'lucide-react/dist/esm/icons/eye';
import Download from 'lucide-react/dist/esm/icons/download';
import FileText from 'lucide-react/dist/esm/icons/file-text';

interface SalaryTableProps {
  paginatedSalaries: any[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDownloadSlip: (salary: any) => void;
  isLoading?: boolean;
}

export const SalaryTable = ({
  paginatedSalaries,
  totalRecords,
  currentPage,
  totalPages,
  onPageChange,
  onDownloadSlip,
  isLoading = false
}: SalaryTableProps) => {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <>
      <DraggableScroll className="rounded-xl border border-border">
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="py-4 px-6 font-semibold text-foreground">{t('salary.employee')}</th>
              <th className="py-4 px-6 font-semibold text-foreground">{t('salary.month')}</th>
              <th className="py-4 px-6 font-semibold text-foreground">{t('salary.baseSalary')}</th>
              <th className="py-4 px-6 font-semibold text-foreground">{t('salary.deductions')}</th>
              <th className="py-4 px-6 font-semibold text-foreground">{t('salary.netSalary')}</th>
              <th className="py-4 px-6 font-semibold text-foreground">{t('salary.paymentId')}</th>
              <th className="py-4 px-6 font-semibold text-foreground">{t('salary.status')}</th>
              <th className="py-4 px-6 font-semibold text-foreground text-center">{t('salary.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="py-4 px-6"><div className="h-4 w-32 bg-muted rounded"></div></td>
                  <td className="py-4 px-6"><div className="h-4 w-20 bg-muted rounded"></div></td>
                  <td className="py-4 px-6"><div className="h-4 w-24 bg-muted rounded"></div></td>
                  <td className="py-4 px-6"><div className="h-4 w-24 bg-muted rounded"></div></td>
                  <td className="py-4 px-6"><div className="h-4 w-24 bg-muted rounded"></div></td>
                  <td className="py-4 px-6"><div className="h-4 w-32 bg-muted rounded"></div></td>
                  <td className="py-4 px-6"><div className="h-6 w-16 bg-muted rounded-full"></div></td>
                  <td className="py-4 px-6"><div className="flex justify-center gap-2"><div className="h-8 w-8 bg-muted rounded"></div><div className="h-8 w-8 bg-muted rounded"></div></div></td>
                </tr>
              ))
            ) : paginatedSalaries.map((salary: any) => (
              <tr key={salary._id} className="hover:bg-muted/30 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 font-medium whitespace-nowrap">
                    <Users className="w-4 h-4 text-primary" /> {salary.user?.name || 'N/A'}
                  </div>
                </td>
                <td className="py-4 px-6 text-muted-foreground">
                  <div className="flex items-center gap-2 text-xs whitespace-nowrap">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(salary.year, salary.month - 1).toLocaleString(locale, { month: 'short' })} {salary.year}
                  </div>
                </td>
                <td className="py-4 px-6 text-foreground font-medium whitespace-nowrap">
                  ₹{salary.baseSalary.toLocaleString()}
                </td>
                <td className="py-4 px-6 text-destructive whitespace-nowrap">
                  <span className="font-medium">
                    ₹-{(salary.esi + salary.pf + salary.vpf + salary.incomeTax + salary.cess + salary.professionalTax + salary.lateDeductions + salary.absentDeductions + salary.halfDayDeductions).toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-6 text-secondary whitespace-nowrap">
                  <span className="font-medium">₹{salary.totalSalary.toLocaleString()}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-mono text-xs border border-border px-2 py-1 rounded-md whitespace-nowrap text-muted-foreground">
                    {salary.razorpayPaymentId || 'N/A'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-secondary border border-secondary">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-1.5 animate-pulse"></div>
                    {t('common.success')}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center space-x-2">
                    <Link href={`/dashboard/reports/slip/${salary._id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="p-2 border-border/60"
                        aria-label={t('salary.viewSlip')}
                        title={t('salary.viewSlip')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownloadSlip(salary)}
                      className="p-2 border-border/60"
                      aria-label={t('salary.downloadSlip')}
                      title={t('salary.downloadSlip')}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && totalRecords === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-12 h-12 mb-3 text-muted-foreground/30" />
                    <h3 className="text-lg font-medium text-foreground mb-1">{t('salary.noSalaryRecords')}</h3>
                    <p>{t('salary.noSalaryRecordsDesc')}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </DraggableScroll>

      {totalRecords > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 md:pt-6 border-t border-border mt-4 md:mt-6 bg-card">
          <div className="text-sm text-muted-foreground px-3 py-1 rounded-md border border-border">
            {t('salary.page')} <span className="font-medium text-foreground">{currentPage}</span> {t('salary.of')} <span className="font-medium text-foreground">{totalPages}</span>
          </div>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 px-3 hover:bg-muted"
            >
              {t('common.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 px-3 hover:bg-muted"
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
