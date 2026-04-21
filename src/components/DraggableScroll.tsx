'use client';

import React from 'react';
import { useDraggableScroll } from '@/hooks/useDraggableScroll';

interface DraggableScrollProps {
  children: React.ReactNode;
  className?: string;
}

const DraggableScroll: React.FC<DraggableScrollProps> = ({ children, className = '' }) => {
  const {
    ref,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onMouseMove,
    onTouchStart,
    onTouchEnd,
    onTouchMove,
    isDragging
  } = useDraggableScroll();

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      className={`overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing ${className} ${isDragging ? 'is-dragging' : ''}`}
      style={{ 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {children}
    </div>
  );
};

export default DraggableScroll;
