import { Card, Skeleton } from '@/components';

export default function TasksLoading() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in w-full">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {Array.from({ length: 9 }).map((_, i) => (
          <Card key={i} className="flex flex-col h-[280px]">
            <div className="p-6 flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
            </div>
            <div className="p-4 border-t border-border/50 flex justify-between items-center bg-muted/5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
