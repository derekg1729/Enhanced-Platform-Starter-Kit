'use client';

import { useTransition } from 'react';
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
  
  const handleSaveModel = async (model: string) => {
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
            apiConnectionId: 'placeholder', // Will be ignored by the API since we're only updating the model
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
  
  return (
    <ModelSelector 
      agentId={agentId} 
      currentModel={currentModel} 
      onSave={handleSaveModel} 
    />
  );
} 