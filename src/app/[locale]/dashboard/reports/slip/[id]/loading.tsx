import { Skeleton } from '@/components';

export default function SalarySlipLoading() {
  return (
    <div className="space-y-6 animate-fade-in w-full pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2 bg-muted/50" />
          <Skeleton className="h-4 w-64 bg-muted/30" />
        </div>
        <Skeleton className="h-6 w-32 rounded-full bg-primary/10" />
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
        {/* Header Strip Skeleton */}
        <div className="p-6 border-b border-border bg-muted/5">
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
              <Skeleton className="w-16 h-16 rounded-full bg-background border-2 border-primary/20 shrink-0" />
              <div className="space-y-4 flex-1 w-full">
                <div>
                  <Skeleton className="h-6 w-56 mb-2 bg-muted/50" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-24 bg-muted/20" />
                    <Skeleton className="h-5 w-32 bg-muted/20" />
                    <Skeleton className="h-5 w-20 bg-muted/20" />
                  </div>
                </div>
                {/* Bank/UPI Skulls */}
                <div className="bg-background/50 rounded-lg p-4 border border-border/50 space-y-2">
                   <Skeleton className="h-3 w-20 bg-muted/40 mb-2" />
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Skeleton className="h-4 w-40 bg-muted/20" />
                      <Skeleton className="h-4 w-40 bg-muted/20" />
                   </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 min-w-[200px] xl:text-right">
              <div>
                <Skeleton className="h-3 w-24 mb-2 xl:ml-auto bg-muted/40" />
                <Skeleton className="h-8 w-48 xl:ml-auto bg-muted/50" />
              </div>
              <div className="space-y-2 bg-background/50 p-3 rounded-lg border border-border/50">
                 <Skeleton className="h-4 w-32 xl:ml-auto bg-muted/20" />
                 <Skeleton className="h-3 w-44 xl:ml-auto bg-muted/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 md:p-8">
          <Skeleton className="h-6 w-48 mb-6 mt-4 bg-muted/50" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings Skeleton Column */}
            <div className="p-6 rounded-xl border border-border/50 bg-green-50/10 dark:bg-green-900/5 space-y-4">
               <Skeleton className="h-4 w-32 bg-green-500/20 mb-4" />
               {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                     <Skeleton className="h-3 w-24 bg-muted/30" />
                     <Skeleton className="h-3 w-16 bg-muted/40" />
                  </div>
               ))}
            </div>

            {/* Deductions Skeleton Column */}
            <div className="p-6 rounded-xl border border-border/50 bg-red-50/10 dark:bg-red-900/5 space-y-4">
               <Skeleton className="h-4 w-32 bg-red-500/20 mb-4" />
               {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                     <Skeleton className="h-3 w-32 bg-muted/30" />
                     <Skeleton className="h-3 w-16 bg-muted/40" />
                  </div>
               ))}
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="mt-12 pt-8 border-t border-border flex flex-col lg:flex-row items-center justify-between gap-8 bg-muted/20 -mx-4 sm:-mx-6 md:-mx-8 -mb-4 sm:-mb-6 md:-mb-8 p-8">
             <Skeleton className="h-12 w-full lg:w-96 bg-muted/20" />
             <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto text-right">
                <div className="space-y-1">
                   <Skeleton className="h-4 w-24 ml-auto bg-muted/30" />
                   <Skeleton className="h-10 w-44 ml-auto bg-green-600/20" />
                </div>
                <Skeleton className="h-12 w-48 rounded-xl bg-primary/30" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
