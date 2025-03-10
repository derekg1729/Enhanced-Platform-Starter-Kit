import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, disabled, ...props }, ref) => {
    const inputClasses = cn(
      'w-full rounded-md px-4 py-2 text-sm transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      {
        'border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200': !error && !disabled,
        'border border-red-500 bg-white text-gray-900 ring-2 ring-red-200 focus:border-red-500 focus:ring-red-200': error && !disabled,
        'border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed': disabled,
      },
      className
    );

    if (leftIcon || rightIcon) {
      return (
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              inputClasses,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10'
            )}
            disabled={disabled}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={inputClasses}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input }; 