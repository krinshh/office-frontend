import { DashboardHeaderSkeleton, DashboardGridSkeleton } from '@/components/dashboard/DashboardSkeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in w-full">
      <DashboardHeaderSkeleton />
      <DashboardGridSkeleton />
    </div>
  );
}
