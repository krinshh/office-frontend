'use client';

import dynamic from 'next/dynamic';

const ReportsClient = dynamic(() => import('@/components/dashboard/reports/ReportsClient').then(mod => mod.ReportsClient), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse bg-muted/20 rounded-lg w-full" />
});

export default function ReportsPage() {
  return (
    <div className="animate-fade-in w-full">
      <ReportsClient />
    </div>
  );
}
