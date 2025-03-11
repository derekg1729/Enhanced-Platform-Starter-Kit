"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AgentCard, { Agent } from './AgentCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

// Simple Plus icon component instead of importing from radix-ui
const PlusIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-2 h-4 w-4"
  >
    <path
      d="M8 2.75C8 2.33579 7.66421 2 7.25 2C6.83579 2 6.5 2.33579 6.5 2.75V6.5H2.75C2.33579 6.5 2 6.83579 2 7.25C2 7.66421 2.33579 8 2.75 8H6.5V11.75C6.5 12.1642 6.83579 12.5 7.25 12.5C7.66421 12.5 8 12.1642 8 11.75V8H11.75C12.1642 8 12.5 7.66421 12.5 7.25C12.5 6.83579 12.1642 6.5 11.75 6.5H8V2.75Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    ></path>
  </svg>
);

interface AgentDashboardProps {
  agents: Agent[];
  isLoading: boolean;
}

export default function AgentDashboard({ agents, isLoading }: AgentDashboardProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAgent = async (agentId: string) => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete agent');
      }
      
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="loading-state">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Agents</h2>
          <button 
            disabled 
            className="bg-blue-600/50 text-white rounded-lg flex items-center gap-1 px-4 py-2 cursor-not-allowed"
          >
            <PlusIcon /> Create Agent
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Your Agents</h2>
        <Link 
          href="/agents/new"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 px-4 py-2"
          data-testid="create-agent-button"
        >
          <PlusIcon /> Create Agent
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded" data-testid="error-message">
          {error}
        </div>
      )}
      
      {agents.length === 0 ? (
        <div className="text-center py-12 border rounded-lg" data-testid="empty-state">
          <p className="text-muted-foreground text-white">You don&apos;t have any agents yet.</p>
          <Link 
            href="/agents/new"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 px-4 py-2 mt-4 inline-flex"
          >
            <PlusIcon /> Create your first agent
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onDelete={handleDeleteAgent}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
} 