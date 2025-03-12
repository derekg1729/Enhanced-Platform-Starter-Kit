"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import ThemeCard from '../ui/ThemeCard';
import React from 'react';

// Define the form schema with Zod
const apiConnectionFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  service: z.string().min(1, { message: 'Service is required' }),
  apiKey: z.string().min(1, { message: 'API Key is required' }),
});

// Infer the form data type from the schema
type ApiConnectionFormData = {
  name: string;
  service: string;
  apiKey: string;
};

// Define the API service type
interface ApiService {
  id: string;
  name: string;
  description: string;
  url: string;
  models: string[];
  keyFormat: RegExp;
  keyName: string;
  keyInstructions: string;
}

interface ApiConnectionFormProps {
  initialData?: {
    id?: string;
    name: string;
    service: string;
  };
  onSubmit?: (data: ApiConnectionFormData) => Promise<void>;
  isEdit?: boolean;
}

export default function ApiConnectionForm({ initialData, onSubmit, isEdit = false }: ApiConnectionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<ApiService[]>([]);
  const [selectedService, setSelectedService] = useState<ApiService | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ApiConnectionFormData>({
    defaultValues: {
      name: initialData?.name || '',
      service: initialData?.service || '',
      apiKey: '',
    },
  });
  
  const watchedService = watch('service');
  
  // Fetch available API services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/api-connections/services');
        if (!response.ok) {
          throw new Error('Failed to fetch API services');
        }
        const data = await response.json();
        setServices(data);
      } catch (err) {
        console.error('Error fetching API services:', err);
        setError('Failed to load API services. Please refresh the page.');
      }
    };
    
    fetchServices();
  }, []);
  
  // Update selected service when service changes
  useEffect(() => {
    if (watchedService && services.length > 0) {
      const service = services.find(s => s.id === watchedService);
      setSelectedService(service || null);
    }
  }, [watchedService, services]);
  
  const handleFormSubmit = async (data: ApiConnectionFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate with Zod manually
      const result = apiConnectionFormSchema.safeParse(data);
      if (!result.success) {
        throw new Error('Validation failed');
      }
      
      // Validate API key format if a service is selected
      if (selectedService && selectedService.keyFormat) {
        const keyFormatRegex = new RegExp(selectedService.keyFormat);
        if (!keyFormatRegex.test(data.apiKey)) {
          throw new Error(`Invalid API key format for ${selectedService.name}`);
        }
      }
      
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Default implementation if no onSubmit is provided
        const endpoint = isEdit && initialData?.id 
          ? `/api/api-connections/${initialData.id}` 
          : '/api/api-connections';
        
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        let errorMessage = 'Failed to save API connection';
        
        try {
          const responseData = await response.json();
          if (!response.ok) {
            errorMessage = responseData.error || errorMessage;
            throw new Error(errorMessage);
          }
          
          // Success - redirect to the API connections page
          router.push('/api-connections');
          router.refresh();
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          throw new Error(errorMessage);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save API connection. Please try again.';
      setError(errorMessage);
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <ThemeCard>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-md text-red-400 text-sm mb-4">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-stone-300 mb-1">
            Connection Name
          </label>
          <Input
            id="name"
            {...register('name', { required: 'Name is required' })}
            placeholder="My OpenAI API"
            className="w-full"
            error={!!errors.name}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-stone-300 mb-1">
            Service
          </label>
          <Select
            id="service"
            {...register('service', { required: 'Service is required' })}
            className="w-full"
            error={!!errors.service}
            disabled={isSubmitting || isEdit}
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </Select>
          {errors.service && (
            <p className="mt-1 text-sm text-red-400">{errors.service.message}</p>
          )}
          {selectedService && (
            <p className="mt-1 text-xs text-stone-500">
              {selectedService.description}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-stone-300 mb-1">
            {selectedService ? selectedService.keyName : 'API Key'}
          </label>
          <Input
            id="apiKey"
            type="password"
            {...register('apiKey', { required: 'API Key is required' })}
            placeholder={selectedService ? `Enter your ${selectedService.keyName}` : 'Enter your API key'}
            className="w-full"
            error={!!errors.apiKey}
            disabled={isSubmitting}
          />
          {errors.apiKey && (
            <p className="mt-1 text-sm text-red-400">{errors.apiKey.message}</p>
          )}
          {selectedService && (
            <p className="mt-1 text-xs text-stone-500">
              {selectedService.keyInstructions}
              {' '}
              <a 
                href={selectedService.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Get API key
              </a>
            </p>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-stone-700">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {isEdit ? 'Update Connection' : 'Create Connection'}
          </Button>
        </div>
      </form>
    </ThemeCard>
  );
} 