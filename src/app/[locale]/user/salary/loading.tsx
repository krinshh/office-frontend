import { Card, Skeleton } from '@/components';

export default function UserSalaryLoading() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in w-full pb-12">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2 bg-muted/50" />
        <Skeleton className="h-4 w-64 bg-muted/30" />
      </div>

      <div className="space-y-6">
        {/* Current Salary Card Skeleton */}
        <Card className="p-4 md:p-6 lg:p-8 border-border/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/60">
            <Skeleton className="w-8 h-8 xs:w-10 xs:h-10 rounded-lg bg-green-500/10" />
            <Skeleton className="h-6 w-64 bg-muted/50" />
          </div>
          
          <div className="space-y-1">
            {/* Earnings Section */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`earning-${i}`} className="flex justify-between items-center py-3 border-b border-border/40">
                <Skeleton className="h-4 w-32 bg-muted/40" />
                <Skeleton className="h-4 w-24 bg-green-500/10" />
              </div>
            ))}
            
            {/* Deductions Section */}
            <div className="pt-4 space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`deduct-${i}`} className="flex justify-between items-center py-3 border-b border-border/40">
                  <Skeleton className="h-4 w-40 bg-muted/40" />
                  <Skeleton className="h-4 w-20 bg-red-500/10" />
                </div>
              ))}
            </div>

            {/* Total Net Pay Skeleton */}
            <div className="flex justify-between items-center py-4 border-t border-border mt-4">
              <Skeleton className="h-6 w-32 bg-muted/60" />
              <Skeleton className="h-8 w-40 bg-green-600/20" />
            </div>
          </div>
          
          <Skeleton className="mt-8 h-12 w-full rounded-lg bg-primary/20" />
        </Card>

        {/* Previous Month Card Skeleton */}
        <Card className="p-4 md:p-6 lg:p-8 border-border/60 shadow-sm opacity-60 grayscale-[0.5]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/60">
            <Skeleton className="w-8 h-8 rounded-lg bg-blue-500/10" />
            <Skeleton className="h-6 w-48 bg-muted/50" />
          </div>
          <div className="space-y-3">
             {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-border/30">
                   <Skeleton className="h-3 w-24 bg-muted/30" />
                   <Skeleton className="h-3 w-16 bg-muted/20" />
                </div>
             ))}
             <Skeleton className="h-10 w-full rounded-lg bg-muted/10 mt-4" />
          </div>
        </Card>
      </div>
    </div>
  );
}
