import { Card, Skeleton, DraggableScroll } from '@/components';

export default function SalaryLoading() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in w-full">
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-6">
        {/* Generate Salary Card Skeleton */}
        <Card className="p-4 md:p-6 lg:p-8 mb-8 border-border/60">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/60">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="sm:col-span-2 lg:col-span-1">
               <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
          <Skeleton className="mt-6 h-10 w-48 rounded-lg" />
        </Card>

        {/* List Card Skeleton */}
        <Card className="p-4 md:p-6 lg:p-8 border-border/60">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border/60">
            <Skeleton className="h-7 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-32 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          </div>

          {/* Search/Filters Skeleton */}
          <div className="mb-6 space-y-4">
             <Skeleton className="h-10 w-full rounded-lg" />
             <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                   <Skeleton key={i} className="h-10 rounded-md" />
                ))}
             </div>
          </div>

          <DraggableScroll className="border border-border/60 rounded-xl overflow-hidden">
            <div className="bg-muted/40 h-12 w-full border-b border-border flex items-center px-6 gap-4 min-w-[1000px]">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="flex-1 h-4" />
              ))}
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 w-full border-b border-border/60 flex items-center px-6 gap-4 bg-card min-w-[1000px]">
                 <div className="flex-1 flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                 </div>
                 {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="flex-1 h-3" />
                 ))}
                 <div className="flex-1 flex justify-center">
                    <Skeleton className="h-8 w-16 rounded-md" />
                 </div>
              </div>
            ))}
          </DraggableScroll>
        </Card>
      </div>
    </div>
  );
}
