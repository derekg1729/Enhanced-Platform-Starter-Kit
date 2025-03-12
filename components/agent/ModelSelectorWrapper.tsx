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
  
  // Fetch the current API connection ID for the agent
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
    // Don't proceed if we don't have the API connection ID
    if (!apiConnectionId) {
      alert('Cannot update model: Missing API connection information');
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
            // Include required fields from the API
            name: 'placeholder', // Will be ignored by the API since we're only updating the model
            systemPrompt: 'placeholder', // Will be ignored by the API since we're only updating the model
            apiConnectionId: apiConnectionId, // Use the actual API connection ID
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
  
  // Show loading state while fetching the API connection ID
  if (isLoading) {
    return (
      <div className="p-4 bg-stone-800 rounded-lg border border-stone-700">
        <p className="text-stone-400">Loading model configuration...</p>
      </div>
    );
  }
  
  // Show error state if we couldn't fetch the API connection ID
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
  
  // Don't render the model selector if we don't have the API connection ID
  if (!apiConnectionId) {
    return (
      <div className="p-4 bg-stone-800 rounded-lg border border-stone-700">
        <p className="text-red-400">No API connection found for this agent. Please add an API connection first.</p>
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