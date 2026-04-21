'use client';

import React, { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import SearchIcon from 'lucide-react/dist/esm/icons/search';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputSize?: 'sm' | 'md' | 'lg'; // renamed to avoid conflict with HTML input size
  icon?: LucideIcon; // optional icon (defaults to search)
  fullWidth?: boolean;
}

const sizeMap = {
  sm: { height: 'h-8', text: 'text-xs', icon: 'w-4 h-4' },
  md: { height: 'h-9', text: 'text-sm', icon: 'w-4 h-4' },
  lg: { height: 'h-10', text: 'text-base', icon: 'w-5 h-5' },
};

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { placeholder = 'Search...', value, onChange, inputSize = 'sm', icon: Icon = SearchIcon, fullWidth = true, className = '', ...props },
    ref
  ) => {
    const { height, text, icon: iconSize } = sizeMap[inputSize];

    return (
      <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`rounded-md border border-input bg-transparent px-3 pl-10 ${height} ${text} w-full shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {Icon && (
          <Icon
            className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${iconSize}`}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;