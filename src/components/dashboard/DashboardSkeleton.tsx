'use client';

import React from 'react';
import Card from '@/components/Card';
import Skeleton from '@/components/Skeleton';

/**
 * Skeleton for the Dashboard Welcome Header
 */
export function DashboardHeaderSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-card border border-border shadow-sm p-4 md:p-6 lg:p-8 pl-5 md:pl-7">
      <div className="relative z-10 w-full">
        {/* H1 Greeting Skeleton - Matches text-2xl sm:text-3xl */}
        <Skeleton className="h-7 md:h-9 w-64 mb-3" animation={false} />
        {/* Subtitle Skeleton - Matches text-base */}
        <Skeleton className="h-4 w-3/4 max-w-lg" animation={false} />
      </div>
    </div>
  );
}

/**
 * Skeleton for a single Dashboard Action Card
 */
export function DashboardCardSkeleton() {
  return (
    <Card className="h-full border border-border bg-card shadow-sm p-0 overflow-hidden" padding="none">
      {/* Matching the Left Accent Bar */}
      <div className="absolute top-0 left-0 w-1 h-full bg-muted/20" />
      
      <div className="flex flex-col items-start p-4 md:p-6 pl-5 md:pl-7 h-full">
        <div className="flex items-center justify-between w-full mb-4">
          {/* Icon Box Skeleton - Matches w-12 h-12 */}
          <Skeleton className="w-12 h-12 rounded-lg" animation={false} />
          {/* View Details Text Placeholder */}
          <Skeleton className="h-3 w-16" animation={false} />
        </div>
        
        {/* Title Skeleton - Matches text-base font-semibold */}
        <Skeleton className="h-5 w-3/4 mb-3" animation={false} />
        
        {/* Description Lines Skeleton - Matches text-sm line-clamp-2 */}
        <div className="space-y-2 w-full">
          <Skeleton className="h-3 w-full" animation={false} />
          <Skeleton className="h-3 w-4/5" animation={false} />
        </div>
      </div>
    </Card>
  );
}

/**
 * Full Dashboard Grid Skeleton with sections
 */
export function DashboardGridSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 w-full pb-12">
      {/* Management/General Section Skeleton */}
      <section>
        <div className="flex items-center gap-4 mb-4 md:mb-6 lg:mb-8">
          <Skeleton className="h-6 w-48" animation={false} />
          <div className="h-px flex-1 bg-border/60" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`mgmt-${i}`} className="h-[160px] md:h-[180px]">
               <DashboardCardSkeleton />
            </div>
          ))}
        </div>
      </section>

      {/* Account Section Skeleton */}
      <section>
        <div className="flex items-center gap-4 mb-4 md:mb-6 lg:mb-8">
          <Skeleton className="h-6 w-48" animation={false} />
          <div className="h-px flex-1 bg-border/60" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`acc-${i}`} className="h-[160px] md:h-[180px]">
               <DashboardCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
