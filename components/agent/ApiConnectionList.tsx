"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import ThemeCard from '../ui/ThemeCard';

interface ApiConnection {
  id: string;
  name: string;
  service: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiConnectionListProps {
  agentId?: string;
  onSelect?: (connection: ApiConnection) => void;
  selectable?: boolean;
}

export default function ApiConnectionList({ agentId, onSelect, selectable = false }: ApiConnectionListProps) {
  const router = useRouter();
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      try {
        // If agentId is provided, fetch connections for that agent
        const endpoint = agentId 
          ? `/api/agents/${agentId}/api-connections` 
          : '/api/api-connections';
        
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Failed to fetch API connections');
        }
        
        const data = await response.json();
        setConnections(data);
      } catch (err) {
        console.error('Error fetching API connections:', err);
        setError('Failed to load API connections. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConnections();
  }, [agentId]);
  
  const handleEdit = (connection: ApiConnection) => {
    router.push(`/api-connections/${connection.id}/edit`);
  };
  
  const handleDelete = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this API connection?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/api-connections/${connectionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete API connection');
      }
      
      // Remove the deleted connection from the list
      setConnections(connections.filter(c => c.id !== connectionId));
    } catch (err) {
      console.error('Error deleting API connection:', err);
      setError('Failed to delete API connection. Please try again.');
    }
  };
  
  const handleSelect = (connection: ApiConnection) => {
    setSelectedConnectionId(connection.id);
    if (onSelect) {
      onSelect(connection);
    }
  };
  
  const getServiceLabel = (serviceId: string) => {
    const serviceMap: Record<string, string> = {
      'openai': 'OpenAI',
      'anthropic': 'Anthropic',
      'google': 'Google AI',
      'custom': 'Custom API',
    };
    
    return serviceMap[serviceId] || serviceId;
  };
  
  if (loading) {
    return (
      <ThemeCard>
        <div className="p-4 text-center">
          <p className="text-stone-400">Loading API connections...</p>
        </div>
      </ThemeCard>
    );
  }
  
  if (error) {
    return (
      <ThemeCard>
        <div className="p-4 text-center">
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
  
  if (connections.length === 0) {
    return (
      <ThemeCard>
        <div className="p-4 text-center">
          <p className="text-stone-400">No API connections found.</p>
          <Button 
            variant="primary" 
            className="mt-2"
            onClick={() => router.push('/api-connections/new')}
          >
            Create API Connection
          </Button>
        </div>
      </ThemeCard>
    );
  }
  
  return (
    <div className="space-y-4">
      {connections.map((connection) => (
        <ThemeCard key={connection.id} className={`transition-all duration-200 ${selectedConnectionId === connection.id ? 'border-blue-500' : ''}`}>
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-white">{connection.name}</h3>
                <p className="text-sm text-stone-400">
                  Service: {getServiceLabel(connection.service)}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Created: {new Date(connection.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                {selectable && (
                  <Button
                    variant={selectedConnectionId === connection.id ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => handleSelect(connection)}
                  >
                    {selectedConnectionId === connection.id ? 'Selected' : 'Select'}
                  </Button>
                )}
                {!selectable && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(connection)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(connection.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </ThemeCard>
      ))}
      
      {!selectable && (
        <div className="flex justify-center mt-4">
          <Button
            variant="primary"
            onClick={() => router.push('/api-connections/new')}
          >
            Add New API Connection
          </Button>
        </div>
      )}
    </div>
  );
} 