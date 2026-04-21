import { Card, Skeleton } from '@/components';

export default function SettingsLoading() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in w-full pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
          <Skeleton className="h-8 w-48 mb-2 bg-muted/50" />
          <Skeleton className="h-4 w-64 bg-muted/30" />
        </div>
      </div>

      {/* Tab Nav Skeleton */}
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden mb-6">
        <div className="flex p-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-32 m-2 rounded-xl bg-muted/20" />
          ))}
        </div>
      </div>

      {/* Tab Content Skeleton */}
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 md:p-6 lg:p-8 space-y-10">
          {/* Section Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <Skeleton className="w-12 h-12 rounded-xl bg-primary/10" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-56 bg-muted/50" />
              <Skeleton className="h-4 w-80 bg-muted/30" />
            </div>
          </div>

          {/* Form Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <Skeleton className="h-5 w-40 bg-muted/40 mb-4" />
               <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                     <div key={i} className="flex items-center p-4 bg-muted/5 border border-border/40 rounded-xl">
                        <Skeleton className="w-5 h-5 rounded-full mr-4 bg-muted/20" />
                        <Skeleton className="h-4 w-44 bg-muted/30" />
                     </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="pt-6 border-t border-border">
             <Skeleton className="h-12 w-44 rounded-xl bg-primary/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
