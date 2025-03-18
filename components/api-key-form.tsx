'use client';

import { useState } from 'react';
import { createApiConnection } from '@/lib/actions';
import { toast } from 'sonner';
import { Eye, EyeOff, Key } from 'lucide-react';
import { Button } from './ui/button';

interface ApiKeyFormProps {
  title?: string;
  description?: string;
  initialService?: string;
}

export default function ApiKeyForm({
  title = "Add API Key",
  description = "Add your API key to use with your agents.",
  initialService = "openai",
}: ApiKeyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [service, setService] = useState(initialService);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const response = await createApiConnection(formData);
      
      if ('error' in response) {
        toast.error(response.error);
      } else {
        toast.success(`${service.charAt(0).toUpperCase() + service.slice(1)} API key added successfully!`);
        // Reset the form
        const form = document.getElementById('api-key-form') as HTMLFormElement;
        form.reset();
      }
    } catch (error) {
      toast.error('Failed to add API key');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-md dark:border-stone-700 dark:bg-stone-800">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p>
      
      <form id="api-key-form" action={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Service
          </label>
          <select
            id="service"
            name="service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-stone-600 dark:bg-stone-700 dark:text-white"
            required
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Name (Optional)
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="My API Key"
            className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-stone-600 dark:bg-stone-700 dark:text-white"
          />
        </div>
        
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            API Key
          </label>
          <div className="relative mt-1">
            <input
              type={showApiKey ? 'text' : 'password'}
              id="apiKey"
              name="apiKey"
              placeholder={service === 'openai' ? 'sk-...' : 'sk-ant-...'}
              className="block w-full rounded-md border border-stone-300 bg-white px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-stone-600 dark:bg-stone-700 dark:text-white"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center px-3 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Your API key is encrypted and stored securely.
          </p>
        </div>
        
        <Button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2"
        >
          <Key className="h-4 w-4" />
          {isLoading ? 'Adding...' : 'Add API Key'}
        </Button>
      </form>
    </div>
  );
} 