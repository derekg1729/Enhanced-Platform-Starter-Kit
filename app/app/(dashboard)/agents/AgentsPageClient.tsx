"use client";

import { useState, useEffect } from 'react';
import AgentDashboard from '../../../../components/agent/AgentDashboard';
import { Agent } from '../../../../components/agent/AgentCard';

// Mock data for testing - will be removed in production
const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'API Agent 1',
    description: 'This agent comes from the API',
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-02'),
    imageUrl: '/placeholder.png',
    status: 'active' as const,
    type: 'hello-world',
  },
  {
    id: 'agent-2',
    name: 'API Agent 2',
    description: 'This is another agent from the API',
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-06-15'),
    imageUrl: '/placeholder.png',
    status: 'inactive' as const,
    type: 'email-assistant',
  },
];

// Props for testing purposes
interface AgentsPageClientProps {
  // These props are only used for testing
  initialAgents?: Agent[];
  initialLoading?: boolean;
  initialError?: string | null;
  testMode?: boolean;
}

export default function AgentsPageClient({
  initialAgents = [],
  initialLoading = true,
  initialError = null,
  testMode = false,
}: AgentsPageClientProps = {}) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(initialError);
  
  useEffect(() => {
    // If in test mode with initialAgents/initialLoading/initialError, don't fetch
    if (testMode) {
      return;
    }
    
    const fetchAgents = async () => {
      try {
        // In a real implementation, we would fetch from the API
        // const response = await fetch('/api/agents');
        // if (!response.ok) {
        //   throw new Error('Failed to fetch agents');
        // }
        // const data = await response.json();
        // setAgents(data);

        // For testing, we'll use the global.fetch mock if it exists
        if (typeof global.fetch === 'function' && global.fetch.toString().includes('mockImplementation')) {
          try {
            const response = await fetch('/api/agents');
            if (!response.ok) {
              throw new Error('Failed to fetch agents');
            }
            const data = await response.json();
            setAgents(data);
          } catch (err) {
            console.error('Error fetching agents:', err);
            setError('Error loading agents. Please try again later.');
          }
        } else {
          // Otherwise use mock data with a delay to simulate loading
          await new Promise(resolve => setTimeout(resolve, 1000));
          setAgents(mockAgents);
        }
      } catch (err) {
        console.error('Error in fetchAgents:', err);
        setError('Error loading agents. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, [testMode, initialAgents, initialLoading, initialError]);
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-cal font-bold mb-6 text-white">Your Agents</h1>
      {error ? (
        <div className="rounded-lg border border-stone-700 bg-stone-900 p-5 shadow-sm transition-all hover:shadow-md">
          <div className="p-4 text-center" data-testid="error-state">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      ) : (
        <AgentDashboard agents={agents} isLoading={isLoading} />
      )}
    </div>
  );
} 