'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  hover?: boolean;
  onClick?: () => void;
  id?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  border = true,
  rounded = 'lg',
  hover = false,
  onClick,
  id,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  };

  const baseClasses = 'bg-card text-card-foreground transition-all duration-200';

  const borderClasses = border ? 'border border-border' : '';

  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : '';

  const interactiveClasses = onClick ? 'cursor-pointer' : '';

  const cardClasses = `${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${borderClasses} ${roundedClasses[rounded]} ${hoverClasses} ${interactiveClasses} ${className}`.trim();

  return (
    <div id={id} className={cardClasses} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      {children}
    </div>
  );
};

export default Card;