'use client';

import { useEffect, useState } from 'react';
import { getApiConnections, deleteApiConnection } from '@/lib/actions';
import { toast } from 'sonner';
import { Trash, Loader2, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import BlurImage from "@/components/blur-image";
import { placeholderBlurhash } from "@/lib/utils";

interface ApiConnection {
  id: string;
  service: string;
  name?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  hasKey: boolean;
}

export default function ApiConnectionsList() {
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const loadConnections = async () => {
    setIsLoading(true);
    try {
      const data = await getApiConnections();
      setConnections(data);
    } catch (error) {
      console.error('Failed to load API connections:', error);
      toast.error('Failed to load API connections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm('Are you sure you want to delete this API connection?')) {
      setDeletingIds(prev => [...prev, id]);
      try {
        const result = await deleteApiConnection(id);
        if (result.success) {
          setConnections(prev => prev.filter(conn => conn.id !== id));
          toast.success(`API connection deleted successfully`);
        } else {
          toast.error('Failed to delete API connection');
        }
      } catch (error) {
        console.error('Error deleting API connection:', error);
        toast.error('Failed to delete API connection');
      } finally {
        setDeletingIds(prev => prev.filter(delId => delId !== id));
      }
    }
  };

  const getServiceDisplayName = (service: string) => {
    return service.charAt(0).toUpperCase() + service.slice(1);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-stone-200 bg-white p-6 shadow-md dark:border-stone-700 dark:bg-stone-800 animate-pulse" role="status">
            <div className="h-44 bg-stone-200 dark:bg-stone-700 rounded-md mb-4"></div>
            <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded-md mb-2 w-3/4"></div>
            <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded-md mb-2 w-1/2"></div>
            <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded-md w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return connections.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {connections.map(connection => (
        <div
          key={connection.id}
          className="relative rounded-lg border border-stone-200 pb-10 shadow-md transition-all hover:shadow-xl dark:border-stone-700 dark:hover:border-white"
        >
          <div className="flex flex-col overflow-hidden rounded-lg">
            <BlurImage
              alt={`${getServiceDisplayName(connection.service)} API Key`}
              width={500}
              height={400}
              className="h-44 object-cover"
              src={`https://avatar.vercel.sh/${connection.id}`}
              placeholder="blur"
              blurDataURL={placeholderBlurhash}
            />
            <div className="border-t border-stone-200 p-4 dark:border-stone-700">
              <h3 className="my-0 truncate font-cal text-xl font-bold tracking-wide dark:text-white">
                {getServiceDisplayName(connection.service)}
              </h3>
              <p className="mt-2 line-clamp-1 text-sm font-normal leading-snug text-stone-500 dark:text-stone-400">
                {connection.name || `${getServiceDisplayName(connection.service)} API Key`}
              </p>
              <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
                <Key className="inline h-3 w-3 mr-1" />
                {connection.hasKey ? 'Key provided' : 'No key provided'}
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500">
                Added: {format(new Date(connection.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 flex w-full justify-end px-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(connection.id, connection.name || '')}
              disabled={deletingIds.includes(connection.id)}
              className="flex items-center"
            >
              {deletingIds.includes(connection.id) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Deleting...</span>
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4" />
                  <span className="ml-2">Delete</span>
                </>
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="mt-20 flex flex-col items-center space-y-4">
      <h1 className="font-cal text-4xl">No API Keys Yet</h1>
      <div className="relative h-60 w-60 text-gray-500">
        <Key className="h-full w-full" />
      </div>
      <p className="text-lg text-stone-500">
        You do not have any API keys yet. Add one to get started with your agents.
      </p>
    </div>
  );
} 