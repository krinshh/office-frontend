import { Suspense } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import { DashboardHeaderSkeleton, DashboardGridSkeleton } from '@/components/dashboard/DashboardSkeleton';

export default function DashboardPage() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in w-full">
      {/* 
        Both the Header and Grid now have their own Suspense boundaries.
        This allows the skeletons to show up independently while the chunks load.
      */}
      <Suspense fallback={<DashboardHeaderSkeleton />}>
        <DashboardHeader />
      </Suspense>
      
      <Suspense fallback={<DashboardGridSkeleton />}>
        <DashboardGrid />
      </Suspense>
    </div>
  );
}
