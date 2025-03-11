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

// Database agent type from the API
interface DbAgent {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  model: string;
  temperature: string;
  maxTokens?: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
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
        
        // Map the database agents to the Agent interface
        const mappedAgents: Agent[] = data.map((dbAgent: DbAgent) => ({
          id: dbAgent.id,
          name: dbAgent.name,
          description: dbAgent.description || '',
          createdAt: dbAgent.createdAt,
          updatedAt: dbAgent.updatedAt,
          imageUrl: '/placeholder.png', // Default image since DB doesn't store images
          status: 'active', // Default status since DB doesn't have a status field yet
          type: dbAgent.model.includes('gpt-4') ? 'advanced' : 'hello-world', // Determine type based on model
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
        <div className="rounded-lg border border-stone-700 bg-stone-900 p-5 shadow-sm transition-all hover:shadow-md" data-testid="error-state">
          <div className="p-4 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      ) : (
        <AgentDashboard agents={agents} isLoading={isLoading} />
      )}
    </div>
  );
} 