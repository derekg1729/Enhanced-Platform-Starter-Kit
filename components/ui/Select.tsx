"use client";

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "w-full rounded-md border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

export { Select }; 