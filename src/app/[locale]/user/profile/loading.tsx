import { Card, Skeleton } from '@/components';

export default function UserProfileLoading() {
  return (
    <div className="space-y-6 animate-fade-in w-full pb-12">
      {/* Header Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-start mb-8">
        <div>
          <Skeleton className="h-9 w-64 mb-3 bg-muted/50" />
          <Skeleton className="h-5 w-96 bg-muted/30" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg bg-muted/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Skeleton */}
        <Card className="lg:col-span-1 h-fit border-t-4 border-t-primary/40">
          <div className="p-6 flex flex-col items-center">
            <Skeleton className="w-32 h-32 rounded-full mb-6 bg-muted/30 shadow-xl" />
            <Skeleton className="h-8 w-48 mb-3 bg-muted/50" />
            <Skeleton className="h-6 w-24 rounded-full mb-8 bg-primary/10" />

            <div className="w-full space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/5">
                  <Skeleton className="w-8 h-8 rounded-lg bg-muted/20" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-16 bg-muted/30" />
                    <Skeleton className="h-4 w-3/4 bg-muted/20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Detailed Information Skeletons */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Information Skeleton */}
          <Card className="p-6 border-border/60">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
              <Skeleton className="w-5 h-5 rounded-md bg-primary/20" />
              <Skeleton className="h-6 w-48 bg-muted/50" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24 bg-muted/30" />
                  <Skeleton className="h-12 w-full rounded-xl bg-muted/10 border border-border/40" />
                </div>
              ))}
              <div className="space-y-2 md:col-span-2">
                <Skeleton className="h-3 w-32 bg-muted/30" />
                <Skeleton className="h-12 w-full rounded-xl bg-muted/10 border border-border/40" />
              </div>
            </div>
          </Card>

          {/* Account Details Skeleton */}
          <Card className="p-6 border-border/60">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
              <Skeleton className="w-5 h-5 rounded-md bg-green-500/20" />
              <Skeleton className="h-6 w-48 bg-muted/50" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                   <Skeleton className="h-4 w-32 bg-muted/30 mb-2" />
                   <Skeleton className="h-10 w-full rounded-lg bg-muted/5 border border-border/40" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
