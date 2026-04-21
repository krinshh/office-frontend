'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = true,
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';

  const animationClasses = animation ? 'animate-pulse' : '';

  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };

  const style: React.CSSProperties = {};
  if (width) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (height) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  const skeletonClasses = `${baseClasses} ${variantClasses[variant]} ${animationClasses} ${className}`.trim();

  return <div className={skeletonClasses} style={style} aria-hidden="true" />;
};

// Skeleton group for loading multiple items
interface SkeletonGroupProps {
  count: number;
  children: React.ReactElement;
  className?: string;
}

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  count,
  children,
  className = '',
}) => {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>{children}</div>
      ))}
    </div>
  );
};

export default Skeleton;