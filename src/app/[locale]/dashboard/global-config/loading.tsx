import { Card, Skeleton } from '@/components';

export default function GlobalConfigLoading() {
  return (
    <div className="space-y-6 animate-fade-in w-full pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4 mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2 bg-muted/50" />
          <Skeleton className="h-4 w-64 bg-muted/30" />
        </div>
      </div>

      {/* PF & ESI Sections (Grid Cards) */}
      <div className="space-y-6">
        {[1, 2, 3].map((section) => (
          <Card key={section} className="p-6 border-border/60 shadow-sm">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
              <Skeleton className="w-8 h-8 rounded-lg bg-muted/30" />
              <Skeleton className="h-6 w-56 bg-muted/50" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-muted/40" />
                  <Skeleton className="h-10 w-full rounded-lg bg-muted/10" />
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4">
               <Skeleton className="h-10 w-44 rounded-lg bg-primary/20" />
            </div>
          </Card>
        ))}
      </div>

      {/* HRA Management Section Skeleton */}
      <Card className="p-6 border-border/60 shadow-sm">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
          <Skeleton className="h-6 w-64 bg-muted/50" />
          <Skeleton className="h-9 w-32 rounded-lg bg-muted/40" />
        </div>
        
        {/* Filters Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
           <Skeleton className="h-10 w-full rounded-lg bg-muted/20" />
           <Skeleton className="h-10 w-full rounded-lg bg-muted/20" />
        </div>

        {/* Table Area */}
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <div className="bg-muted/40 p-4 border-b border-border grid grid-cols-5 gap-4">
             {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-24 bg-muted/50" />
             ))}
          </div>
          <div className="p-2 space-y-1">
             {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 grid grid-cols-5 gap-4 border-b border-border/30 last:border-0 items-center">
                   <Skeleton className="h-4 w-32 bg-muted/20" />
                   <Skeleton className="h-4 w-24 bg-muted/20" />
                   <Skeleton className="h-4 w-40 bg-muted/20" />
                   <Skeleton className="h-4 w-12 bg-muted/20" />
                   <Skeleton className="h-8 w-16 bg-muted/20 rounded" />
                </div>
             ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
