import { Card, Skeleton } from '@/components';

export default function AttendanceLoading() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in w-full pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4 w-full">
        <div className="w-full sm:w-auto">
          <Skeleton className="h-8 w-48 mb-2 bg-muted/50" />
          <Skeleton className="h-4 w-64 bg-muted/30" />
        </div>
        <Skeleton className="h-9 w-48 rounded-lg bg-muted/50" />
      </div>

      {/* Filters Skeleton */}
      <Card className="p-4 md:p-6 lg:p-8 border-border/60 shadow-sm">
        <Skeleton className="h-6 w-32 mb-4 bg-muted/50" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          <Skeleton className="h-10 w-full rounded-lg bg-muted/30" />
          <Skeleton className="h-10 w-full rounded-lg bg-muted/30" />
          <Skeleton className="h-10 w-full rounded-lg bg-muted/30" />
          <Skeleton className="h-10 w-full rounded-lg bg-muted/30" />
        </div>
      </Card>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6 h-32 flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-24 mb-2 bg-muted/40" />
              <Skeleton className="h-8 w-16 bg-muted/60" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl bg-muted/30" />
          </Card>
        ))}
      </div>

      {/* Live Presence Board Skeleton (Bonus for smooth transition) */}
      <Card className="p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
           <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg bg-muted/50" />
              <Skeleton className="h-6 w-48 bg-muted/50" />
           </div>
           <Skeleton className="h-5 w-24 rounded-md bg-muted/30" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
           {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                 <Skeleton className="w-20 h-20 rounded-2xl mb-3 bg-muted/30" />
                 <Skeleton className="h-4 w-20 mb-1 bg-muted/40" />
                 <Skeleton className="h-3 w-16 bg-muted/20" />
              </div>
           ))}
        </div>
      </Card>

      {/* Office Wise Stats Skeleton */}
      <Card className="p-4 md:p-6 lg:p-8">
        <Skeleton className="h-6 w-48 mb-6 bg-muted/50" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 border border-border/60 rounded-xl bg-muted/5">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-5 w-32 bg-muted/50" />
                <Skeleton className="h-5 w-20 rounded-full bg-muted/30" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Skeleton className="h-16 w-full rounded-lg bg-muted/20" />
                <Skeleton className="h-16 w-full rounded-lg bg-muted/20" />
              </div>
              <Skeleton className="h-2 w-full rounded-full bg-muted/20" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
