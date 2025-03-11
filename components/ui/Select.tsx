"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, disabled, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full rounded-md px-4 py-2 text-sm transition-colors appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          {
            'border border-stone-700 bg-stone-800 text-white placeholder-stone-500 focus:border-blue-500 focus:ring-blue-200': !error && !disabled,
            'border border-red-500 bg-stone-800 text-white ring-2 ring-red-200 focus:border-red-500 focus:ring-red-200': error && !disabled,
            'border border-stone-700 bg-stone-900 text-stone-400 cursor-not-allowed': disabled,
          },
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

export { Select }; 