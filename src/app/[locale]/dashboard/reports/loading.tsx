import { Card, Skeleton } from '@/components';

export default function ReportsLoading() {
  return (
    <div className="space-y-6 animate-fade-in w-full pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-4 border-border/60">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="w-8 h-8 rounded-lg bg-muted/30" />
            </div>
            <Skeleton className="h-8 w-16 mt-2 bg-muted/50" />
            <Skeleton className="h-3 w-20 mt-1" />
          </Card>
        ))}
      </div>

      {/* Report Types Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6 border-border/60">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/60">
              <Skeleton className="w-10 h-10 rounded-xl bg-muted/30" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="space-y-2">
                   <Skeleton className="h-3 w-20" />
                   <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                 <Skeleton className="h-10 w-full rounded-lg" />
                 <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                 </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
