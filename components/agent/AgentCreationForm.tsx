"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Slider } from '../ui/Slider';
import ThemeCard from '../ui/ThemeCard';

// Define the form schema with Zod
const agentFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  prompt: z.string().min(1, { message: 'Prompt is required' }),
  model: z.string().default('gpt-3.5-turbo'),
  temperature: z.number().min(0).max(1).default(0.7),
});

// Infer the form data type from the schema
type AgentFormData = {
  name: string;
  description: string;
  prompt: string;
  model: string;
  temperature: number;
};

interface AgentCreationFormProps {
  onSubmit?: (data: AgentFormData) => Promise<void>;
}

export default function AgentCreationForm({ onSubmit }: AgentCreationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AgentFormData>({
    defaultValues: {
      name: '',
      description: '',
      prompt: '',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
    },
  });
  
  const temperature = watch('temperature');
  
  const handleFormSubmit = async (data: AgentFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate with Zod manually
      const result = agentFormSchema.safeParse(data);
      if (!result.success) {
        throw new Error('Validation failed');
      }
      
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Send the data to the API
        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            systemPrompt: data.prompt,
            model: data.model,
            temperature: data.temperature,
            maxTokens: 2048, // Default max tokens
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create agent');
        }

        const agent = await response.json();
        router.push('/agents');
      }
    } catch (err) {
      setError('Failed to create agent. Please try again.');
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    router.push('/agents');
  };
  
  return (
    <ThemeCard>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-md text-red-400 text-sm mb-4" data-testid="error-message">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-stone-300 mb-1">
            Name
          </label>
          <Input
            id="name"
            {...register('name', { required: 'Name is required' })}
            placeholder="My Awesome Agent"
            className="w-full"
            error={!!errors.name}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-stone-300 mb-1">
            Description
          </label>
          <Textarea
            id="description"
            {...register('description', { required: 'Description is required' })}
            placeholder="A helpful assistant that can answer questions about..."
            className="w-full h-24"
            error={!!errors.description}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-stone-300 mb-1">
            Prompt
          </label>
          <Textarea
            id="prompt"
            {...register('prompt', { required: 'Prompt is required' })}
            placeholder="You are a helpful assistant that..."
            className="w-full h-32"
            error={!!errors.prompt}
            disabled={isSubmitting}
          />
          {errors.prompt && (
            <p className="mt-1 text-sm text-red-400">{errors.prompt.message}</p>
          )}
          <p className="mt-1 text-xs text-stone-500">
            This is the system prompt that defines your agent&apos;s behavior and capabilities.
          </p>
        </div>
        
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-stone-300 mb-1">
            Model
          </label>
          <Select
            id="model"
            {...register('model')}
            className="w-full"
            error={!!errors.model}
            disabled={isSubmitting}
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
          </Select>
          {errors.model && (
            <p className="mt-1 text-sm text-red-400">{errors.model.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="temperature" className="block text-sm font-medium text-stone-300 mb-1">
            Temperature: {temperature.toFixed(1)}
          </label>
          <Slider
            id="temperature"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(value) => setValue('temperature', value)}
            className="w-full"
            error={!!errors.temperature}
            disabled={isSubmitting}
          />
          {errors.temperature && (
            <p className="mt-1 text-sm text-red-400">{errors.temperature.message}</p>
          )}
          <div className="flex justify-between text-xs text-stone-500 mt-1">
            <span>More Deterministic</span>
            <span>More Creative</span>
          </div>
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
            Create Agent
          </Button>
        </div>
      </form>
    </ThemeCard>
  );
} 