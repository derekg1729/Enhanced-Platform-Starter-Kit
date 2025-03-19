import Anthropic from '@anthropic-ai/sdk';
import { AIModel, ModelProvider } from './types';

/**
 * Definition of all supported Anthropic models
 * This is the single source of truth for Anthropic model information
 */
interface AnthropicModelDefinition {
  id: string;               // Full versioned ID used by the API
  name: string;             // Human-readable name
  userFriendlyId?: string;  // Optional simplified ID for user input
  capabilities: {
    vision: boolean;
    functionCalling: boolean;
  };
  maxTokens: number;
  defaultTemperature: number;
}

/**
 * Central registry of all supported Anthropic models
 * This is the ONLY place models should be defined
 */
const ANTHROPIC_MODELS: AnthropicModelDefinition[] = [
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    userFriendlyId: 'claude-3-opus',
    capabilities: {
      vision: true,
      functionCalling: false
    },
    maxTokens: 4096,
    defaultTemperature: 0.7
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    userFriendlyId: 'claude-3.5-sonnet',
    capabilities: {
      vision: true,
      functionCalling: false
    },
    maxTokens: 4096,
    defaultTemperature: 0.7
  },
  {
    id: 'claude-3.7-sonnet-20240229',
    name: 'Claude 3.7 Sonnet',
    userFriendlyId: 'claude-3.7-sonnet',
    capabilities: {
      vision: true,
      functionCalling: false
    },
    maxTokens: 4096,
    defaultTemperature: 0.7
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    userFriendlyId: 'claude-3.5-haiku',
    capabilities: {
      vision: true,
      functionCalling: false
    },
    maxTokens: 4096,
    defaultTemperature: 0.7
  },
  {
    id: 'claude-2.1',
    name: 'Claude 2',
    userFriendlyId: 'claude-2',
    capabilities: {
      vision: false,
      functionCalling: false
    },
    maxTokens: 4096,
    defaultTemperature: 0.7
  },
  {
    id: 'claude-instant-1.2',
    name: 'Claude Instant',
    userFriendlyId: 'claude-instant-1',
    capabilities: {
      vision: false,
      functionCalling: false
    },
    maxTokens: 4096,
    defaultTemperature: 0.7
  }
];

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
  
  /** Cache for models */
  private modelsCache: AIModel[] | null = null;
  
  /** Last time models were fetched */
  private lastFetchTime: number = 0;
  
  /** Cache TTL in milliseconds (1 hour) */
  private cacheTTL = 3600000;
  
  /**
   * Convert the internal model definitions to the AIModel format
   * @returns Array of AIModel objects
   */
  private getModelDefinitions(): AIModel[] {
    return ANTHROPIC_MODELS.map(model => ({
      id: model.id,
      name: model.name,
      provider: this.id,
      capabilities: model.capabilities,
      maxTokens: model.maxTokens,
      defaultTemperature: model.defaultTemperature
    }));
  }
  
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
    
    // Get the default models
    const defaultModels = this.getModelDefinitions();
    
    // If no API key, return default models
    if (!apiKey) {
      return defaultModels;
    }
    
    try {
      // Validate the API key
      const isValid = await this.validateApiKey(apiKey);
      if (!isValid) {
        return defaultModels;
      }
      
      // Anthropic doesn't have a models endpoint, so we use our predefined list
      const models = this.getModelDefinitions();
      
      // Cache the models
      this.modelsCache = models;
      this.lastFetchTime = Date.now();
      
      return models;
    } catch (error) {
      console.error('Failed to fetch Anthropic models:', error);
      return defaultModels;
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
        model: ANTHROPIC_MODELS[0].id, // Use first available model ID
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
    // Check if the model ID is already a fully qualified ID
    const exactMatch = ANTHROPIC_MODELS.find(model => model.id === modelId);
    if (exactMatch) {
      return modelId;
    }
    
    // Try to find a model with the corresponding user-friendly ID
    const model = ANTHROPIC_MODELS.find(m => m.userFriendlyId === modelId);
    
    // Return the fully qualified ID if found, otherwise return the original ID
    return model ? model.id : modelId;
  }
}

// Create and export an instance of the provider
export const anthropicProvider = new AnthropicProvider(); 