"use client";

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import ThemeCard from '../ui/ThemeCard';
import ApiConnectionList from './ApiConnectionList';

interface ApiConnection {
  id: string;
  name: string;
  service: string;
  createdAt: string;
  updatedAt: string;
}

interface AgentApiConnectionManagerProps {
  agentId: string;
}

export default function AgentApiConnectionManager({ agentId }: AgentApiConnectionManagerProps) {
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [availableConnections, setAvailableConnections] = useState<ApiConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<ApiConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Fetch agent's API connections
  const fetchAgentConnections = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}/api-connections`);
      if (!response.ok) {
        throw new Error('Failed to fetch agent API connections');
      }
      
      const data = await response.json();
      setConnections(data);
    } catch (err) {
      console.error('Error fetching agent API connections:', err);
      setError('Failed to load agent API connections. Please try again.');
    }
  };
  
  // Fetch all available API connections
  const fetchAvailableConnections = async () => {
    try {
      const response = await fetch('/api/api-connections');
      if (!response.ok) {
        throw new Error('Failed to fetch available API connections');
      }
      
      const data = await response.json();
      setAvailableConnections(data);
    } catch (err) {
      console.error('Error fetching available API connections:', err);
      setError('Failed to load available API connections. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAgentConnections();
      await fetchAvailableConnections();
    };
    
    loadData();
  }, [agentId]);
  
  // Connect an API connection to the agent
  const connectApiConnection = async () => {
    if (!selectedConnection) return;
    
    setIsConnecting(true);
    try {
      const response = await fetch(`/api/agents/${agentId}/api-connections/${selectedConnection.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect API connection to agent');
      }
      
      // Refresh the connections list
      await fetchAgentConnections();
      setShowAddConnection(false);
      setSelectedConnection(null);
    } catch (err) {
      console.error('Error connecting API connection:', err);
      setError('Failed to connect API connection. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Disconnect an API connection from the agent
  const disconnectApiConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this API connection from the agent?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/agents/${agentId}/api-connections/${connectionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect API connection from agent');
      }
      
      // Refresh the connections list
      await fetchAgentConnections();
    } catch (err) {
      console.error('Error disconnecting API connection:', err);
      setError('Failed to disconnect API connection. Please try again.');
    }
  };
  
  // Filter out connections that are already connected to the agent
  const getFilteredAvailableConnections = () => {
    const connectedIds = connections.map(c => c.id);
    return availableConnections.filter(c => !connectedIds.includes(c.id));
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
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Connected API Services</h2>
          <Button
            variant="primary"
            onClick={() => setShowAddConnection(!showAddConnection)}
          >
            {showAddConnection ? 'Cancel' : 'Add Connection'}
          </Button>
        </div>
        
        {connections.length === 0 ? (
          <ThemeCard>
            <div className="p-4 text-center">
              <p className="text-stone-400">No API connections connected to this agent.</p>
            </div>
          </ThemeCard>
        ) : (
          <div className="space-y-4">
            {connections.map((connection) => (
              <ThemeCard key={connection.id}>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-white">{connection.name}</h3>
                      <p className="text-sm text-stone-400">
                        Service: {connection.service}
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => disconnectApiConnection(connection.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              </ThemeCard>
            ))}
          </div>
        )}
      </div>
      
      {showAddConnection && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Add API Connection</h3>
          
          {getFilteredAvailableConnections().length === 0 ? (
            <ThemeCard>
              <div className="p-4 text-center">
                <p className="text-stone-400">No available API connections to add.</p>
                <Button 
                  variant="primary" 
                  className="mt-2"
                  onClick={() => window.open('/api-connections/new', '_blank')}
                >
                  Create New API Connection
                </Button>
              </div>
            </ThemeCard>
          ) : (
            <>
              <ApiConnectionList 
                selectable={true}
                onSelect={(connection) => setSelectedConnection(connection)}
              />
              
              <div className="flex justify-end mt-4">
                <Button
                  variant="primary"
                  disabled={!selectedConnection || isConnecting}
                  isLoading={isConnecting}
                  onClick={connectApiConnection}
                >
                  Connect Selected API
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 