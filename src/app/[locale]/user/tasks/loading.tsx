import { Card, Skeleton } from '@/components';

export default function UserTasksLoading() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in w-full pb-12">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2 bg-muted/50" />
          <Skeleton className="h-4 w-64 bg-muted/30" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg bg-primary/20" />
      </div>

      {/* Task Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="flex flex-col h-full border-border/60 bg-card overflow-hidden">
            {/* Priority Strip */}
            <Skeleton className="h-full w-1.5 absolute left-0 bg-muted/20" />
            
            <div className="p-5 pl-7 flex-1 space-y-4">
              <div className="flex gap-4">
                {/* Avatar Icon Skull */}
                <Skeleton className="flex-shrink-0 w-12 h-12 rounded-xl bg-muted/30" />
                
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                     <Skeleton className="h-5 w-3/4 bg-muted/50" />
                     <Skeleton className="h-4 w-12 rounded-full bg-muted/20" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full bg-muted/10" />
                </div>
              </div>

              {/* Description Skulls */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-full bg-muted/20" />
                <Skeleton className="h-3 w-2/3 bg-muted/20" />
              </div>

              {/* Tags Area */}
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-md bg-muted/10" />
                <Skeleton className="h-6 w-24 rounded-md bg-muted/10" />
              </div>
            </div>

            {/* Footer Skull */}
            <div className="p-4 bg-muted/30 border-t border-border pl-7 flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-2 w-12 bg-muted/40" />
                <Skeleton className="h-4 w-20 bg-muted/30" />
              </div>
              <Skeleton className="h-9 w-24 rounded-lg bg-primary/20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
