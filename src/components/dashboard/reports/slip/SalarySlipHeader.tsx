'use client';

interface SalarySlipHeaderProps {
  salary: any;
  t: any;
}

export function SalarySlipHeader({ salary, t }: SalarySlipHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 md:p-6 border-b border-border">
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row items-center flex-1 gap-4">
          <div className="w-16 h-16 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center text-2xl font-bold text-primary shadow-sm shrink-0">
            {salary.user?.name?.charAt(0) || 'U'}
          </div>
          <div className="space-y-4 flex-1 w-full">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{salary.user?.name}</h2>
                <span className="font-medium bg-background px-2 py-0.5 rounded border border-border/50">{salary.user?.userType?.name}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <span className="opacity-70">Joined:</span>
                  {salary.user?.joiningDate ? new Date(salary.user.joiningDate).toLocaleDateString() : 'N/A'}
                </span>
                <span className="hidden sm:inline">•</span>
                <span>{salary.user?.office?.name}</span>
              </div>
            </div>


          </div>
        </div>
        {(() => {
          const details = salary.accountDetails || salary.user?.accountDetails;
          if (!details) return null;

          const showUpi = details.upiId && (!details.accountNumber || salary.payoutMethod === 'upi');

          if (showUpi) {
            return (
              <div className="bg-background/50 rounded-lg p-3 border border-border/50 text-sm grid grid-cols-1 gap-y-1">
                <div className="text-muted-foreground font-medium mb-1 text-xs uppercase tracking-wider">UPI Details</div>
                <div className="flex justify-between sm:justify-start sm:gap-2">
                  <span className="text-muted-foreground">UPI ID:</span>
                  <span className="font-mono">{details.upiId}</span>
                </div>
                <div className="flex justify-between sm:justify-start sm:gap-2">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{details.name || salary.user?.name || 'N/A'}</span>
                </div>
              </div>
            );
          }

          return (
            <div className="bg-background/50 rounded-lg p-3 border border-border/50 text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
              <div className="text-muted-foreground font-medium col-span-full mb-1 text-xs uppercase tracking-wider">Bank Details</div>
              <div className="flex justify-between sm:justify-start sm:gap-2">
                <span className="text-muted-foreground">Account:</span>
                <span className="font-mono">{details.accountNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-2">
                <span className="text-muted-foreground">IFSC:</span>
                <span className="font-mono">{details.ifsc || 'N/A'}</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-2 sm:col-span-2">
                <span className="text-muted-foreground">Name:</span>
                <span>{details.name || salary.user?.name || 'N/A'}</span>
              </div>
            </div>
          );
        })()}

        <div className="flex flex-col gap-4 min-w-[200px] xl:text-right">
          <div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">{t('salarySlip.salaryPeriod')}</div>
            <div className="text-2xl font-bold text-foreground">{new Date(0, salary.month - 1).toLocaleString('default', { month: 'long' })} {salary.year}</div>
          </div>

          <div className="space-y-1 text-sm bg-background/50 p-3 rounded-lg border border-border/50">
            <div className="flex justify-between xl:justify-end gap-2">
              <span className="text-muted-foreground">Status:</span>
              <span className={`font-bold capitalize ${salary.payoutStatus === 'completed' ? 'text-secondary' : 'text-warning'}`}>
                {salary.payoutStatus || 'Pending'}
              </span>
            </div>
            <div className="flex justify-between xl:justify-end gap-2">
              <span className="text-muted-foreground">Ref ID:</span>
              <span className="font-mono text-xs">{salary.razorpayPaymentId || salary.payoutId || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
