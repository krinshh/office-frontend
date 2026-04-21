import { Card, Skeleton, DraggableScroll } from '@/components';

export default function AuditLoading() {
  return (
    <div className="space-y-6 animate-fade-in w-full pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2 bg-muted/50" />
          <Skeleton className="h-4 w-64 bg-muted/30" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <Card className="p-6 border-border/60 shadow-sm">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
          <Skeleton className="w-10 h-10 rounded-xl bg-muted/30" />
          <Skeleton className="h-6 w-32 bg-muted/50" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20 bg-muted/40" />
              <Skeleton className="h-10 w-full bg-muted/20 rounded-lg" />
            </div>
          ))}
        </div>
      </Card>

      {/* Table Skeleton */}
      <Card className="p-6 border-border/60">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-border/60">
          <div className="flex gap-3 items-center">
            <Skeleton className="w-9 h-9 rounded-lg bg-green-500/10" />
            <Skeleton className="h-7 w-40 bg-muted/50" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg bg-muted/40" />
        </div>

        <DraggableScroll className="border rounded-xl border-border/60 bg-card overflow-hidden">
          {/* Header Row */}
          <div className="bg-muted/40 border-b border-border grid grid-cols-6 gap-4 px-6 py-4 min-w-[800px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-24 bg-muted/60" />
            ))}
          </div>

          {/* Table Rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b border-border/60 grid grid-cols-6 gap-4 px-6 py-4 items-center last:border-0 hover:bg-muted/5 min-w-[800px]">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full bg-muted/40 shrink-0" />
                <Skeleton className="h-4 w-24 bg-muted/40" />
              </div>
              <Skeleton className="h-6 w-28 rounded-full bg-muted/30" />
              <Skeleton className="h-6 w-20 rounded bg-muted/30" />
              <Skeleton className="h-6 w-full max-w-[150px] rounded bg-muted/20" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-3.5 h-3.5 rounded-full bg-muted/30" />
                <Skeleton className="h-3 w-32 bg-muted/40" />
              </div>
              <Skeleton className="h-3 w-24 bg-muted/40" />
            </div>
          ))}
        </DraggableScroll>
      </Card>
    </div>
  );
}
