"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface ThemeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function ThemeCard({ children, className, ...props }: ThemeCardProps) {
  return (
    <div 
      className={cn(
        "rounded-lg border border-stone-700 bg-stone-900 p-5 shadow-sm transition-all hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 