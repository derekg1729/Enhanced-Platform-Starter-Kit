"use client";

import { useState } from "react";
import { Thermometer, BookText, ChevronDown, ChevronUp } from "lucide-react";

// Map model IDs to display names
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
  "gpt-4": "GPT-4",
  "gpt-4-turbo": "GPT-4 Turbo",
  "claude-2": "Claude 2",
  "claude-instant-1": "Claude Instant",
  "claude-3-opus": "Claude 3 Opus",
  "claude-3-sonnet": "Claude 3 Sonnet",
  "claude-3-haiku": "Claude 3 Haiku",
};

export default function AgentDetails({ agent }: { agent: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-6 w-full">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-lg border border-stone-200 bg-white p-4 text-left shadow-sm dark:border-stone-700 dark:bg-stone-800"
      >
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-stone-500 dark:text-stone-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a8 8 0 0 0-8 8v4a1 1 0 0 1-1 1H2a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1a1 1 0 0 1-1-1v-4a8 8 0 0 0-8-8z"/>
            <circle cx="12" cy="9" r="1"/>
            <circle cx="9" cy="12" r="1"/>
            <circle cx="15" cy="12" r="1"/>
          </svg>
          <h3 className="text-sm font-medium text-stone-900 dark:text-white">Agent Configuration</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-stone-500 dark:text-stone-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-stone-500 dark:text-stone-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 w-full">
          {/* Temperature */}
          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-800">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-stone-500 dark:text-stone-400" />
              <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400">Temperature</h3>
            </div>
            <div className="mt-2 flex items-center">
              <div className="flex-1">
                <div className="h-2 w-full bg-stone-200 rounded-full dark:bg-stone-700">
                  <div 
                    className="h-2 rounded-full bg-blue-500" 
                    style={{ width: `${((agent.temperature || 0.7) / 2) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="ml-2 text-sm font-medium text-stone-900 dark:text-white">
                {agent.temperature?.toFixed(1) || "0.7"}
              </span>
            </div>
            <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
              {agent.temperature && agent.temperature <= 0.5 
                ? "Lower temperature produces more deterministic, focused responses" 
                : agent.temperature && agent.temperature >= 1.5
                ? "Higher temperature produces more random, creative responses"
                : "Balanced temperature for consistent but varied responses"}
            </p>
          </div>
          
          {/* Model */}
          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-800">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-stone-500 dark:text-stone-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a8 8 0 0 0-8 8v4a1 1 0 0 1-1 1H2a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1a1 1 0 0 1-1-1v-4a8 8 0 0 0-8-8z"/>
                <circle cx="12" cy="9" r="1"/>
                <circle cx="9" cy="12" r="1"/>
                <circle cx="15" cy="12" r="1"/>
              </svg>
              <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400">Model</h3>
            </div>
            <p className="mt-2 text-sm font-medium text-stone-900 dark:text-white">
              {MODEL_DISPLAY_NAMES[agent.model] || agent.model}
            </p>
            <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
              {agent.model.includes('gpt-4') 
                ? "GPT-4 models excel at complex reasoning and understanding" 
                : agent.model.includes('claude-3')
                ? "Claude models provide nuanced, thoughtful responses"
                : "AI language model for generating human-like text"}
            </p>
          </div>
          
          {/* Instructions (Conditional) */}
          {agent.instructions && (
            <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-800 sm:col-span-2">
              <div className="flex items-center space-x-2 mb-2">
                <BookText className="h-5 w-5 text-stone-500 dark:text-stone-400" />
                <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400">Instructions</h3>
              </div>
              <div className="p-3 rounded-md bg-stone-50 dark:bg-stone-900">
                <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                  {agent.instructions}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 