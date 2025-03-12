'use client';

import { useTransition, useState, useEffect } from 'react';
import ModelSelector from './ModelSelector';

interface ModelSelectorWrapperProps {
  agentId: string;
  currentModel: string;
  userId: string;
}

export default function ModelSelectorWrapper({ 
  agentId, 
  currentModel, 
  userId 
}: ModelSelectorWrapperProps) {
  const [isPending, startTransition] = useTransition();
  const [apiConnectionId, setApiConnectionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string>('');
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  
  // Fetch the current agent details
  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch the agent details to get the current API connection ID
        const response = await fetch(`/api/agents/${agentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch agent details');
        }
        
        const agentData = await response.json();
        setApiConnectionId(agentData.apiConnectionId);
        setAgentName(agentData.name);
        setSystemPrompt(agentData.systemPrompt);
      } catch (err) {
        console.error('Error fetching agent details:', err);
        setError('Failed to load agent details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAgentDetails();
  }, [agentId]);
  
  const handleSaveModel = async (model: string) => {
    // Don't proceed if we don't have the API connection ID or agent details
    if (!apiConnectionId || !agentName || !systemPrompt) {
      alert('Cannot update model: Missing agent information');
      return;
    }
    
    startTransition(async () => {
      try {
        // Update the agent model
        const response = await fetch(`/api/agents/${agentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            // Include the actual agent details instead of placeholders
            name: agentName,
            systemPrompt: systemPrompt,
            apiConnectionId: apiConnectionId,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update model');
        }
        
        // Refresh the page to show the updated model
        window.location.reload();
      } catch (error) {
        console.error('Error updating model:', error);
        alert('Failed to update model. Please try again.');
      }
    });
  };
  
  // Show loading state while fetching the agent details
  if (isLoading) {
    return (
      <div className="p-4 bg-stone-800 rounded-lg border border-stone-700">
        <p className="text-stone-400">Loading model configuration...</p>
      </div>
    );
  }
  
  // Show error state if we couldn't fetch the agent details
  if (error) {
    return (
      <div className="p-4 bg-stone-800 rounded-lg border border-stone-700">
        <p className="text-red-400">{error}</p>
        <button 
          className="mt-2 px-3 py-1 text-sm bg-stone-700 text-white rounded hover:bg-stone-600"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Don't render the model selector if we don't have the required agent details
  if (!apiConnectionId || !agentName || !systemPrompt) {
    return (
      <div className="p-4 bg-stone-800 rounded-lg border border-stone-700">
        <p className="text-red-400">Missing agent information. Please refresh the page and try again.</p>
      </div>
    );
  }
  
  return (
    <ModelSelector 
      agentId={agentId} 
      currentModel={currentModel} 
      onSave={handleSaveModel} 
    />
  );
} 