import { Card, Skeleton } from '@/components';

export default function NotificationsLoading() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in w-full pb-12">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap gap-4 md:gap-6 lg:gap-8 pb-4 border-b border-border/60">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Skeleton className="h-10 flex-1 sm:w-32 rounded-lg" />
          <Skeleton className="h-10 flex-1 sm:w-32 rounded-lg" />
        </div>
      </div>

      <Card className="rounded-2xl overflow-hidden shadow-sm border-border/60" padding="none">
        <div className="p-6 md:p-8 border-b border-border">
          <Skeleton className="h-8 w-56 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="p-6 md:p-8 space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-5 rounded-2xl border border-border/60 bg-muted/5 relative">
              {/* Fake accent bar */}
              <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full bg-muted/20" />
              
              <Skeleton className="w-12 h-12 rounded-2xl border border-border/20 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-2 w-2 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-24 rounded-lg" />
                </div>
                <div className="flex gap-2">
                   <Skeleton className="h-5 w-16 rounded-md px-2" />
                   <Skeleton className="h-5 w-32 rounded-md px-2" />
                </div>
                <div className="space-y-2 pt-1">
                   <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
