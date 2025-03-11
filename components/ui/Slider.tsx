"use client";

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface SliderProps {
  id?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  error?: boolean;
  disabled?: boolean;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ id, min, max, step = 1, value, onChange, className, error, disabled, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value));
    };
    
    const percentage = ((value - min) / (max - min)) * 100;
    
    return (
      <div className={cn("relative w-full", className)}>
        <input
          ref={ref}
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer",
            error && "border-red-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #374151 ${percentage}%, #374151 100%)`
          }}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider }; 