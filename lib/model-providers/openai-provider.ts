import OpenAI from 'openai';
import { AIModel, ModelProvider } from './types';

/**
 * OpenAI model provider implementation
 * 
 * This provider handles fetching and validating models from OpenAI.
 */
export class OpenAIProvider implements ModelProvider {
  /** Provider ID */
  readonly id = 'openai';
  
  /** Provider name */
  readonly name = 'OpenAI';
  
  /** Default models that will be returned if API fails */
  readonly defaultModels: AIModel[] = [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      capabilities: {
        functionCalling: true,
        vision: true
      },
      maxTokens: 32768,
      defaultTemperature: 0.7
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      capabilities: {
        functionCalling: true,
        vision: true
      },
      maxTokens: 32768,
      defaultTemperature: 0.7
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      capabilities: {
        functionCalling: true
      },
      maxTokens: 8192,
      defaultTemperature: 0.7
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      capabilities: {
        functionCalling: true
      },
      maxTokens: 4096,
      defaultTemperature: 0.7
    }
  ];
  
  /** Cache for models */
  private modelsCache: AIModel[] | null = null;
  
  /** Last time models were fetched */
  private lastFetchTime: number = 0;
  
  /** Cache TTL in milliseconds (1 hour) */
  private cacheTTL = 3600000;
  
  /** Model mappings to convert API response to AIModel */
  private modelMappings: Record<string, {
    name: string,
    capabilities: Record<string, boolean>,
    maxTokens?: number,
    defaultTemperature?: number
  }> = {
    'gpt-4o': {
      name: 'GPT-4o',
      capabilities: {
        functionCalling: true,
        vision: true,
      },
      maxTokens: 32768,
      defaultTemperature: 0.7
    },
    'gpt-4-turbo': {
      name: 'GPT-4 Turbo',
      capabilities: {
        functionCalling: true,
        vision: true
      },
      maxTokens: 32768,
      defaultTemperature: 0.7
    },
    'gpt-4-vision-preview': {
      name: 'GPT-4 Vision',
      capabilities: {
        functionCalling: true,
        vision: true
      },
      maxTokens: 8192,
      defaultTemperature: 0.7
    },
    'gpt-4': {
      name: 'GPT-4',
      capabilities: {
        functionCalling: true
      },
      maxTokens: 8192,
      defaultTemperature: 0.7
    },
    'gpt-3.5-turbo': {
      name: 'GPT-3.5 Turbo',
      capabilities: {
        functionCalling: true
      },
      maxTokens: 4096,
      defaultTemperature: 0.7
    }
  };
  
  /**
   * Create an OpenAI client with the provided API key
   * 
   * @param apiKey OpenAI API key
   * @returns OpenAI client
   */
  private createClient(apiKey: string) {
    return new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Allow API calls from browser for client-side model fetching
    });
  }
  
  /**
   * Get available models from OpenAI or from cache
   * 
   * @param apiKey Optional API key to use for fetching models
   * @returns Promise that resolves to an array of models
   */
  async getModels(apiKey?: string): Promise<AIModel[]> {
    // If we have a recent cache, use it
    if (this.modelsCache && Date.now() - this.lastFetchTime < this.cacheTTL) {
      return this.modelsCache;
    }
    
    // If no API key, return default models
    if (!apiKey) {
      return this.defaultModels;
    }
    
    try {
      const client = this.createClient(apiKey);
      const response = await client.models.list();
      
      // Transform the API response into our model format
      const models: AIModel[] = response.data
        .filter(model => this.isChatModel(model.id)) // Only include chat models
        .map(model => this.mapToAIModel(model.id));
      
      // Cache the models
      this.modelsCache = models;
      this.lastFetchTime = Date.now();
      
      return models;
    } catch (error) {
      console.error('Failed to fetch OpenAI models:', error);
      return this.defaultModels;
    }
  }
  
  /**
   * Map an OpenAI model ID to our AIModel format
   * 
   * @param modelId Model ID from API
   * @returns AIModel
   */
  private mapToAIModel(modelId: string): AIModel {
    const mapping = this.modelMappings[modelId];
    
    if (mapping) {
      return {
        id: modelId,
        name: mapping.name,
        provider: this.id,
        capabilities: mapping.capabilities,
        maxTokens: mapping.maxTokens,
        defaultTemperature: mapping.defaultTemperature
      };
    }
    
    // For unknown models, create a basic entry
    return {
      id: modelId,
      name: this.formatModelName(modelId),
      provider: this.id,
      capabilities: {}
    };
  }
  
  /**
   * Format a model ID into a readable name
   * 
   * @param modelId Model ID
   * @returns Formatted model name
   */
  private formatModelName(modelId: string): string {
    return modelId
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  
  /**
   * Check if a model is a chat model
   * 
   * @param modelId Model ID
   * @returns True if it's a chat model
   */
  private isChatModel(modelId: string): boolean {
    // Exclude non-chat models
    return !modelId.includes('whisper') && 
           !modelId.includes('embedding') &&
           !modelId.includes('tts') &&
           !modelId.includes('dall-e');
  }
  
  /**
   * Validate an OpenAI API key
   * 
   * @param apiKey API key to validate
   * @returns Promise that resolves to true if the key is valid
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) return false;
    
    try {
      const client = this.createClient(apiKey);
      await client.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create and export an instance of the provider
export const openaiProvider = new OpenAIProvider(); 