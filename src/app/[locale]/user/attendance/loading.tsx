import { Card, Skeleton } from '@/components';

export default function UserAttendanceLoading() {
  return (
    <div className="space-y-6 animate-fade-in w-full pb-12">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2 bg-muted/50" />
        <Skeleton className="h-4 w-96 bg-muted/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mark Attendance Card Skeleton */}
        <Card className="p-6 border-border/60">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/60">
            <Skeleton className="w-10 h-10 rounded-xl bg-primary/10" />
            <Skeleton className="h-6 w-48 bg-muted/50" />
          </div>
          <div className="space-y-4">
            {/* Live Clock & Info Skulls */}
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg bg-muted/20" />
            ))}
            
            {/* GeoFence Map Skeleton */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 bg-primary/20" />
                <Skeleton className="h-4 w-32 bg-muted/40" />
              </div>
              <Skeleton className="h-[300px] w-full rounded-xl bg-muted/30 border border-border/40" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-10 flex-1 rounded-lg bg-primary/20" />
              <Skeleton className="h-10 flex-1 rounded-lg bg-muted/30" />
            </div>

            {/* Quick Stats Grid */}
            <div className="p-4 bg-muted/5 rounded-xl border border-border/60 mt-4">
               <Skeleton className="h-3 w-24 mb-3 bg-muted/40" />
               <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full rounded-lg bg-blue-500/5" />
                  <Skeleton className="h-16 w-full rounded-lg bg-orange-500/5" />
               </div>
            </div>
          </div>
        </Card>

        {/* Today's Summary Card Skeleton */}
        <div className="space-y-6">
          <Card className="p-6 border-border/60">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/60">
              <Skeleton className="w-10 h-10 rounded-xl bg-blue-500/10" />
              <Skeleton className="h-6 w-48 bg-muted/50" />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full rounded-lg bg-muted/10" />
                <Skeleton className="h-24 w-full rounded-lg bg-muted/10" />
              </div>
              
              {/* Recent History Table Skull */}
              <div className="p-4 bg-muted/5 rounded-lg border border-border/40">
                <Skeleton className="h-4 w-32 mb-4 bg-muted/40" />
                <div className="space-y-3">
                   {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex justify-between items-center bg-card p-2 rounded">
                         <div className="space-y-1">
                            <Skeleton className="h-3 w-20 bg-muted/30" />
                            <Skeleton className="h-2 w-32 bg-muted/20" />
                         </div>
                         <Skeleton className="h-5 w-16 rounded-full bg-muted/20" />
                      </div>
                   ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Weekly Overview Skeleton */}
      <Card className="p-6 border-border/60">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/60">
          <Skeleton className="w-10 h-10 rounded-xl bg-purple-500/10" />
          <Skeleton className="h-6 w-48 bg-muted/50" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-4 bg-card border border-border/60 rounded-lg text-center space-y-2">
              <Skeleton className="h-3 w-8 mx-auto bg-muted/40" />
              <Skeleton className="w-3 h-3 rounded-full mx-auto bg-muted/20" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
