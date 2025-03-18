'use client';

import { useState, FormEvent } from 'react';
import { createApiConnection } from '@/lib/actions';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApiKeyFormProps {
  title?: string;
  description?: string;
  initialService?: string;
}

// Define the possible response types
type ApiConnectionSuccess = {
  id: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  service: string;
  encryptedApiKey: string;
};

type ApiConnectionError = {
  error: string;
};

type ApiConnectionResponse = ApiConnectionSuccess | ApiConnectionError;

export function ApiKeyForm({
  title = 'Add API Key',
  description = 'Add your API key to use with your agents.',
  initialService = 'openai',
  onSuccess,
}: ApiKeyFormProps & { onSuccess?: () => void }) {
  const [service, setService] = useState(initialService);
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!service || !apiKey) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a FormData object to pass to the server action
      const formData = new FormData();
      formData.append('service', service);
      formData.append('apiKey', apiKey);
      if (name) {
        formData.append('name', name);
      }
      
      const result = await createApiConnection(formData) as ApiConnectionResponse;
      
      // Check if the result is an error response
      if ('error' in result) {
        toast.error(`Error adding API key: ${result.error}`);
      } 
      // Otherwise it's a success response
      else {
        toast.success('API key added successfully');
        // Reset form
        setService(initialService);
        setName('');
        setApiKey('');
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error adding API key:', error);
      toast.error('Failed to add API key');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-md dark:border-stone-700 dark:bg-stone-800">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        {description}
      </p>
      
      <form onSubmit={handleSubmit} className="mt-4 space-y-4" role="form">
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Service
          </label>
          <select
            id="service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-stone-600 dark:bg-stone-700 dark:text-white"
            required
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My OpenAI Key"
            className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-stone-600 dark:bg-stone-700 dark:text-white"
          />
        </div>
        
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            API Key Value
          </label>
          <div className="relative mt-1">
            <input
              type={showApiKey ? 'text' : 'password'}
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={service === 'openai' ? 'sk-...' : 'sk-ant-...'}
              className="block w-full rounded-md border border-stone-300 bg-white px-3 py-2 pr-10 text-sm text-stone-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-stone-600 dark:bg-stone-700 dark:text-white"
              required
            />
            <button
              type="button"
              onClick={toggleApiKeyVisibility}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
              aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Your API key will be encrypted before storage.
          </p>
        </div>
        
        <Button
          type="submit"
          disabled={isSubmitting || !apiKey}
          className="w-full"
        >
          {isSubmitting ? 'Adding...' : 'Add API Key'}
        </Button>
      </form>
    </div>
  );
}

export default ApiKeyForm; 