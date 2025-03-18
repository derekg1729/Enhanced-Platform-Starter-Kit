"use client";

import Image from "next/image";
import { useState } from "react";
import { Bot } from "lucide-react";

export default function EmptyAgentsState() {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="mt-20 flex flex-col items-center space-y-8">
      <h1 className="font-cal text-4xl text-stone-800 dark:text-white">No Agents Yet</h1>
      
      <div className="relative h-64 w-64 flex items-center justify-center">
        {!imageError ? (
          <Image
            alt="missing agent"
            src="https://illustrations.popsy.co/gray/artificial-intelligence.svg"
            width={400}
            height={400}
            className="object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <Bot size={120} className="text-stone-300 dark:text-stone-600" />
        )}
      </div>
      
      <p className="text-lg text-stone-500 dark:text-stone-400">
        You do not have any agents yet. Create one to get started.
      </p>
    </div>
  );
} 