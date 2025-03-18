'use client';

import { useEffect, useState } from 'react';
import { getApiConnections, deleteApiConnection } from '@/lib/actions';
import { toast } from 'sonner';
import { Trash2, Key, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';

interface ApiConnection {
  id: string;
  service: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  hasKey: boolean;
}

export default function ApiConnectionsList() {
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadConnections = async () => {
    setIsLoading(true);
    try {
      const data = await getApiConnections();
      setConnections(data);
    } catch (error) {
      console.error('Error loading API connections:', error);
      toast.error('Failed to load API connections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this API connection?')) {
      setIsDeleting(id);
      try {
        const response = await deleteApiConnection(id);
        if ('error' in response) {
          toast.error(response.error);
        } else {
          toast.success('API connection deleted successfully');
          // Remove the deleted connection from the state
          setConnections(connections.filter(conn => conn.id !== id));
        }
      } catch (error) {
        console.error('Error deleting API connection:', error);
        toast.error('Failed to delete API connection');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const getServiceDisplayName = (service: string) => {
    return service.charAt(0).toUpperCase() + service.slice(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-stone-500" />
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-6 text-center shadow-md dark:border-stone-700 dark:bg-stone-800">
        <Key className="mx-auto h-12 w-12 text-stone-400" />
        <h3 className="mt-2 text-lg font-medium">No API Connections</h3>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Add an API key to get started with your agents.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white shadow-md dark:border-stone-700 dark:bg-stone-800">
      <div className="p-4">
        <h2 className="text-xl font-bold">Your API Connections</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Manage your API connections for different AI services.
        </p>
      </div>
      <div className="divide-y divide-stone-200 dark:divide-stone-700">
        {connections.map((connection) => (
          <div key={connection.id} className="flex items-center justify-between p-4">
            <div>
              <div className="flex items-center">
                <Key className="mr-2 h-4 w-4 text-stone-500" />
                <h3 className="font-medium">
                  {connection.name || getServiceDisplayName(connection.service)}
                </h3>
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {getServiceDisplayName(connection.service)}
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500">
                Updated {formatDistanceToNow(new Date(connection.updatedAt))} ago
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(connection.id)}
              disabled={isDeleting === connection.id}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting === connection.id ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 