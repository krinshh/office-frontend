import { UsersHeaderSkeleton, UsersGridSkeleton } from '@/components/dashboard/users/UsersSkeleton';

export default function UsersLoading() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in w-full pb-12">
      <UsersHeaderSkeleton />
      <UsersGridSkeleton />
    </div>
  );
}
