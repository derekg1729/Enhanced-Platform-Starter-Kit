"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import ThemeCard from '../ui/ThemeCard';

interface ApiService {
  id: string;
  name: string;
  models: string[];
}

interface ApiConnection {
  id: string;
  name: string;
  service: string;
}

interface ModelSelectorProps {
  agentId: string;
  currentModel: string;
  onSave: (model: string) => void;
}

export default function ModelSelector({ agentId, currentModel, onSave }: ModelSelectorProps) {
  const [model, setModel] = useState(currentModel);
  const [apiServices, setApiServices] = useState<ApiService[]>([]);
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch API services and agent connections
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch API services to get available models
        const servicesResponse = await fetch('/api/api-connections/services');
        if (!servicesResponse.ok) {
          throw new Error('Failed to fetch API services');
        }
        const servicesData = await servicesResponse.json();
        setApiServices(servicesData);
        
        // Fetch agent's API connections
        const connectionsResponse = await fetch(`/api/agents/${agentId}/api-connections`);
        if (!connectionsResponse.ok) {
          throw new Error('Failed to fetch agent connections');
        }
        const connectionsData = await connectionsResponse.json();
        setConnections(connectionsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load models. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [agentId]);
  
  // Get available models based on connected services
  const getAvailableModels = () => {
    // Get the service IDs of connected API services
    const connectedServiceIds = connections.map(conn => conn.service);
    
    // Get all models from connected services
    let availableModels: string[] = [];
    
    // Filter API services to only include connected ones
    const connectedServices = apiServices.filter(service => 
      connectedServiceIds.includes(service.id)
    );
    
    // Add all models from connected services to the available models array
    connectedServices.forEach(service => {
      availableModels = [...availableModels, ...service.models];
    });
    
    return availableModels;
  };
  
  // Handle model change
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
  };
  
  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      onSave(model);
    } catch (err) {
      console.error('Error saving model:', err);
      setError('Failed to save model. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <ThemeCard>
        <div className="p-4">
          <p className="text-stone-400">Loading models...</p>
        </div>
      </ThemeCard>
    );
  }
  
  if (error) {
    return (
      <ThemeCard>
        <div className="p-4">
          <p className="text-red-400">{error}</p>
          <Button 
            variant="ghost" 
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </ThemeCard>
    );
  }
  
  const availableModels = getAvailableModels();
  
  return (
    <ThemeCard>
      <div className="p-4">
        <h3 className="text-lg font-medium text-white mb-4">Model Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-stone-300 mb-1">
              Model
            </label>
            <Select
              id="model"
              value={model}
              onChange={handleModelChange}
              className="w-full"
            >
              {availableModels.map((modelOption) => (
                <option key={modelOption} value={modelOption}>
                  {modelOption}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-xs text-stone-500">
              Select a model from your connected API services.
            </p>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving || model === currentModel}
              isLoading={isSaving}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </ThemeCard>
  );
} 