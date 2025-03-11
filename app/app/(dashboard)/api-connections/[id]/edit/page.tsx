"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ApiConnectionForm from '../../../../../../components/agent/ApiConnectionForm';
import ThemeCard from '../../../../../../components/ui/ThemeCard';
import { Button } from '../../../../../../components/ui/Button';

interface ApiConnection {
  id: string;
  name: string;
  service: string;
}

export default function EditApiConnectionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [apiConnection, setApiConnection] = useState<ApiConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchApiConnection = async () => {
      try {
        const response = await fetch(`/api/api-connections/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch API connection');
        }
        
        const data = await response.json();
        setApiConnection(data);
      } catch (err) {
        console.error('Error fetching API connection:', err);
        setError('Failed to load API connection. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApiConnection();
  }, [params.id]);
  
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Edit API Connection</h1>
        </div>
        
        <ThemeCard>
          <div className="p-4 text-center">
            <p className="text-stone-400">Loading API connection...</p>
          </div>
        </ThemeCard>
      </div>
    );
  }
  
  if (error || !apiConnection) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Edit API Connection</h1>
        </div>
        
        <ThemeCard>
          <div className="p-4 text-center">
            <p className="text-red-400">{error || 'API connection not found'}</p>
            <Button 
              variant="ghost" 
              className="mt-2"
              onClick={() => router.push('/api-connections')}
            >
              Back to API Connections
            </Button>
          </div>
        </ThemeCard>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Edit API Connection</h1>
        <p className="text-stone-400">
          Update your API connection details. Note that you will need to re-enter your API key for security reasons.
        </p>
      </div>
      
      <ApiConnectionForm 
        initialData={apiConnection}
        isEdit={true}
      />
    </div>
  );
} 