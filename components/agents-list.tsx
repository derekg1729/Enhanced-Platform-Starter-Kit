'use client';

import { Agent } from '@/lib/schema';
import AgentCard from './agent-card';
import { Button } from './ui/button';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface AgentsListProps {
  agents: Agent[];
  loading: boolean;
}

export default function AgentsList({ agents, loading }: AgentsListProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <p className="text-lg text-gray-500">Loading agents...</p>
      </div>
    );
  }

  const handleCreateAgent = () => {
    router.push('/app/agents/new');
  };

  return (
    <div data-testid="agents-list-container" className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Agents</h2>
        <Button onClick={handleCreateAgent} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Create Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border border-dashed border-gray-300 rounded-lg">
          <p className="text-lg font-medium">No agents found</p>
          <p className="text-gray-500 mt-1">Create your first agent to get started.</p>
          <Button onClick={handleCreateAgent} className="mt-4 flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Create Agent
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
} 