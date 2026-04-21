import { Card, Skeleton } from '@/components';

export default function OfficesLoading() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in w-full pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 lg:gap-8 pb-4 border-b border-border/60">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Offices Grid Skeleton */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 md:gap-6 lg:gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden p-0 border-border/60 shadow-sm">
            <Skeleton className="aspect-video w-full" />
            <div className="p-5 space-y-5">
              <div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/10 rounded-lg border border-border/40">
                <div className="space-y-2">
                   <Skeleton className="h-3 w-10" />
                   <Skeleton className="h-4 w-full" />
                </div>
                <div className="space-y-2">
                   <Skeleton className="h-3 w-10" />
                   <Skeleton className="h-4 w-full" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-7 w-24 rounded-md" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-10 rounded-lg" />
                  <Skeleton className="h-8 w-10 rounded-lg" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
