import Anthropic from '@anthropic-ai/sdk';
import { AIModel, ModelProvider } from './types';

/**
 * Anthropic model provider implementation
 * 
 * This provider handles fetching and validating models from Anthropic.
 */
export class AnthropicProvider implements ModelProvider {
  /** Provider ID */
  readonly id = 'anthropic';
  
  /** Provider name */
  readonly name = 'Anthropic';
  
  /** Default models that will be returned if API fails */
  readonly defaultModels: AIModel[] = [
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      capabilities: {
        vision: true,
        functionCalling: false
      },
      maxTokens: 4096,
      defaultTemperature: 0.7
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      capabilities: {
        vision: true,
        functionCalling: false
      },
      maxTokens: 4096,
      defaultTemperature: 0.7
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      capabilities: {
        vision: true,
        functionCalling: false
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
  
  /** Model mappings for user-friendly names */
  private modelNameMappings: Record<string, string> = {
    'claude-3-opus-20240229': 'Claude 3 Opus',
    'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
    'claude-3-haiku-20240307': 'Claude 3 Haiku',
    'claude-2.1': 'Claude 2',
    'claude-instant-1.2': 'Claude Instant'
  };
  
  /** Model capabilities */
  private modelCapabilities: Record<string, Record<string, boolean>> = {
    'claude-3-opus-20240229': {
      vision: true,
      functionCalling: false
    },
    'claude-3-sonnet-20240229': {
      vision: true,
      functionCalling: false
    },
    'claude-3-haiku-20240307': {
      vision: true,
      functionCalling: false
    },
    'claude-2.1': {
      vision: false,
      functionCalling: false
    },
    'claude-instant-1.2': {
      vision: false,
      functionCalling: false
    }
  };
  
  /** Model max tokens */
  private modelMaxTokens: Record<string, number> = {
    'claude-3-opus-20240229': 4096,
    'claude-3-sonnet-20240229': 4096,
    'claude-3-haiku-20240307': 4096, 
    'claude-2.1': 4096,
    'claude-instant-1.2': 4096
  };
  
  /**
   * Create an Anthropic client with the provided API key
   * 
   * @param apiKey Anthropic API key
   * @returns Anthropic client
   */
  private createClient(apiKey: string) {
    return new Anthropic({ 
      apiKey,
      dangerouslyAllowBrowser: true // Allow API calls from browser for client-side model fetching
    });
  }
  
  /**
   * Get available models from Anthropic
   * 
   * Note: Anthropic doesn't have a models endpoint, so we use a predefined list
   * 
   * @param apiKey Optional API key to use for validating
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
      // Validate the API key
      const isValid = await this.validateApiKey(apiKey);
      if (!isValid) {
        return this.defaultModels;
      }
      
      // Anthropic doesn't have a models endpoint, so we use our predefined list
      const models: AIModel[] = [
        {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          provider: this.id,
          capabilities: this.modelCapabilities['claude-3-opus-20240229'],
          maxTokens: this.modelMaxTokens['claude-3-opus-20240229'],
          defaultTemperature: 0.7
        },
        {
          id: 'claude-3-sonnet-20240229',
          name: 'Claude 3 Sonnet',
          provider: this.id,
          capabilities: this.modelCapabilities['claude-3-sonnet-20240229'],
          maxTokens: this.modelMaxTokens['claude-3-sonnet-20240229'],
          defaultTemperature: 0.7
        },
        {
          id: 'claude-3-haiku-20240307',
          name: 'Claude 3 Haiku',
          provider: this.id,
          capabilities: this.modelCapabilities['claude-3-haiku-20240307'],
          maxTokens: this.modelMaxTokens['claude-3-haiku-20240307'],
          defaultTemperature: 0.7
        },
        {
          id: 'claude-2.1',
          name: 'Claude 2',
          provider: this.id,
          capabilities: this.modelCapabilities['claude-2.1'],
          maxTokens: this.modelMaxTokens['claude-2.1'],
          defaultTemperature: 0.7
        },
        {
          id: 'claude-instant-1.2',
          name: 'Claude Instant',
          provider: this.id,
          capabilities: this.modelCapabilities['claude-instant-1.2'],
          maxTokens: this.modelMaxTokens['claude-instant-1.2'],
          defaultTemperature: 0.7
        }
      ];
      
      // Cache the models
      this.modelsCache = models;
      this.lastFetchTime = Date.now();
      
      return models;
    } catch (error) {
      console.error('Failed to fetch Anthropic models:', error);
      return this.defaultModels;
    }
  }
  
  /**
   * Validate an Anthropic API key by making a request
   * 
   * @param apiKey API key to validate
   * @returns Promise that resolves to true if the key is valid
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) return false;
    
    try {
      const client = this.createClient(apiKey);
      
      // Make a minimal request to validate the API key
      // We'll use messages.create with minimal parameters
      await client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hello' }]
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get the actual model ID for an Anthropic model
   * This is used to correct common version issues in model names
   * 
   * @param modelId User-friendly model ID
   * @returns Fully qualified model ID
   */
  getFriendlyModelId(modelId: string): string {
    // Map user-friendly model IDs to full IDs
    const friendlyModelMap: Record<string, string> = {
      'claude-3-opus': 'claude-3-opus-20240229',
      'claude-3-sonnet': 'claude-3-sonnet-20240229',
      'claude-3-haiku': 'claude-3-haiku-20240307',
      'claude-2': 'claude-2.1',
      'claude-instant-1': 'claude-instant-1.2'
    };
    
    return friendlyModelMap[modelId] || modelId;
  }
}

// Create and export an instance of the provider
export const anthropicProvider = new AnthropicProvider(); 