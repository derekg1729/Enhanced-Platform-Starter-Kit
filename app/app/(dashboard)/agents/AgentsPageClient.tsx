"use client";

import { useState, useEffect } from 'react';
import AgentDashboard from '../../../../components/agent/AgentDashboard';
import { Agent } from '../../../../components/agent/AgentCard';

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
        // Fetch agents from the API
        const response = await fetch('/api/agents');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch agents: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Map the API response to the Agent interface
        const mappedAgents: Agent[] = data.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          description: agent.description || '',
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt,
          imageUrl: agent.imageUrl || '/placeholder.png',
          status: agent.status || 'active',
          type: agent.type || 'hello-world',
        }));
        
        setAgents(mappedAgents);
      } catch (err) {
        console.error('Error fetching agents:', err);
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