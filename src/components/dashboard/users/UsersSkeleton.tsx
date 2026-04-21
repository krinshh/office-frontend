'use client';

import React from 'react';
import Card from '@/components/Card';
import Skeleton from '@/components/Skeleton';

export function UserCardSkeleton() {
  return (
    <Card className="group border border-border bg-card shadow-sm p-5 overflow-hidden animate-pulse will-change-opacity">
      <div className="flex items-start justify-between mb-4">
        {/* Photo Skeleton - 12x12 (48px) */}
        <Skeleton animation={false} className="w-12 h-12 rounded-xl" />

        {/* Buttons Skeleton */}
        <div className="flex gap-2">
          <Skeleton animation={false} className="w-8 h-8 rounded-md" />
          <Skeleton animation={false} className="w-8 h-8 rounded-md" />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          {/* Name */}
          <Skeleton animation={false} className="h-5 w-3/4 mb-2" />
          {/* Email */}
          <Skeleton animation={false} className="h-4 w-full mb-1" />
          {/* Mobile */}
          <Skeleton animation={false} className="h-4 w-1/2" />
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Skeleton animation={false} className="h-5 w-16 rounded-full" />
          <Skeleton animation={false} className="h-5 w-24 rounded-full" />
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <Skeleton animation={false} className="h-4 w-20" />
            <Skeleton animation={false} className="h-4 w-28" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function UsersHeaderSkeleton() {
  return (
    <div className="flex flex-wrap items-start gap-3 animate-pulse mb-6 md:mb-8 pb-4 border-b border-border/60">
      <div className="flex-shrink-0 whitespace-nowrap">
        {/* Title and Subtitle */}
        <Skeleton className="h-7 w-40 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="flex-grow hidden sm:block" />

      <div className="flex flex-wrap items-start gap-3 gap-x-4 w-full sm:w-auto">
        {/* Search Input Skeleton - min-w 150px to max-w 180px */}
        <div className="min-w-[150px] max-w-[180px] flex-shrink-0">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        <div className="flex flex-nowrap gap-x-4">
          {/* Manage Roles button */}
          <Skeleton className="h-9 w-32 rounded-md" />
          {/* Add User button */}
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}



export function UsersGridSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 md:gap-6 lg:gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function UserViewSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6 pb-4 md:pb-6 animate-pulse will-change-opacity">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 border-b pb-4 md:pb-6 font-pulse">
        <Skeleton variant="circular" animation={false} className="w-24 h-24 ring-2 ring-primary/20" />
        <div className="flex flex-col items-center md:items-start flex-1 space-y-2">
          <Skeleton animation={false} className="h-8 w-48" />
          <Skeleton animation={false} className="h-4 w-64" />
          <div className="flex gap-2 mt-2">
            <Skeleton animation={false} className="h-6 w-20 rounded-full" />
            <Skeleton animation={false} className="h-6 w-24 rounded-full" />
            <Skeleton animation={false} className="h-6 w-28 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton animation={false} className="h-32 w-full rounded-lg" />
        <Skeleton animation={false} className="h-32 w-full rounded-lg" />
        <Skeleton animation={false} className="h-24 md:col-span-2 w-full rounded-lg" />
      </div>
      <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-border/40">
        <Skeleton animation={false} className="h-10 w-32 rounded-md" />
        <Skeleton animation={false} className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
}

export function UserFormSkeleton() {
  return (
    <div className="space-y-8 animate-pulse will-change-opacity pb-4">
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton animation={false} className="h-6 w-44" />
          <Skeleton animation={false} className="h-[2px] w-full bg-muted/20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton animation={false} className="h-4 w-28" />
              <Skeleton animation={false} className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton animation={false} className="h-6 w-48" />
          <Skeleton animation={false} className="h-[2px] w-full bg-muted/20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton animation={false} className="h-4 w-28" />
              <Skeleton animation={false} className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
        <Skeleton animation={false} className="h-10 w-24 rounded-md" />
        <Skeleton animation={false} className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
}



export function UserTypeSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6 animate-pulse px-1">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-36 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-hidden border border-border/60 p-3 rounded-lg bg-muted/5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-md border border-border bg-card">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
}



