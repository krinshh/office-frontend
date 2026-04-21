'use client';

import React from 'react';
import Skeleton, { SkeletonGroup } from './Skeleton';
import Spinner from './Spinner';

interface LoadingProps {
  type?: 'spinner' | 'skeleton' | 'skeleton-list';
  size?: 'sm' | 'md' | 'lg';
  count?: number;
  className?: string;
  label?: string;
}

const Loading: React.FC<LoadingProps> = ({
  type = 'spinner',
  size = 'md',
  count = 3,
  className = '',
  label,
}) => {
  if (type === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 p-8 ${className}`}>
        <div className="relative flex items-center justify-center">
          <Spinner size={size} />
        </div>
        {label && (
          <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase animate-pulse">
            {label}
          </p>
        )}
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (type === 'skeleton-list') {
    return (
      <div className={`space-y-4 ${className}`}>
        <SkeletonGroup count={count}>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </SkeletonGroup>
      </div>
    );
  }

  return null;
};

export default Loading;
