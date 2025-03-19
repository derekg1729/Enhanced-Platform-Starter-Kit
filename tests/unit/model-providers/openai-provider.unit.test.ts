import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AIModel } from '../../../lib/model-providers/types';

// We'll mock the OpenAI API client here
// The actual implementation will handle this differently
class MockOpenAIClient {
  apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  // Mock models.list method
  async models() {
    return {
      data: [
        {
          id: 'gpt-4',
          object: 'model',
          created: 1677649963,
          owned_by: 'openai'
        },
        {
          id: 'gpt-4-vision-preview',
          object: 'model',
          created: 1677649963,
          owned_by: 'openai'
        },
        {
          id: 'gpt-3.5-turbo',
          object: 'model',
          created: 1677649963,
          owned_by: 'openai'
        },
        {
          id: 'whisper-1',  // Non-chat model
          object: 'model',
          created: 1677649963,
          owned_by: 'openai'
        }
      ]
    };
  }
}

// Mock the OpenAI provider implementation
// The actual implementation will be in lib/model-providers/openai-provider.ts
class MockOpenAIProvider {
  id = 'openai';
  name = 'OpenAI';
  
  // Default models that will be returned if API fails
  defaultModels: AIModel[] = [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      capabilities: {
        functionCalling: true
      }
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      capabilities: {
        functionCalling: true
      }
    }
  ];
  
  // Models cache
  private modelsCache: AIModel[] | null = null;
  private lastFetchTime: number = 0;
  private cacheTTL = 3600000; // 1 hour in milliseconds
  
  // Model name mappings and capabilities
  private modelMappings: Record<string, { name: string, capabilities: Record<string, boolean> }> = {
    'gpt-4': {
      name: 'GPT-4',
      capabilities: {
        functionCalling: true
      }
    },
    'gpt-4-vision-preview': {
      name: 'GPT-4 Vision',
      capabilities: {
        functionCalling: true,
        vision: true
      }
    },
    'gpt-3.5-turbo': {
      name: 'GPT-3.5 Turbo',
      capabilities: {
        functionCalling: true
      }
    }
  };
  
  // Method to create an OpenAI client with the API key
  private createClient(apiKey: string) {
    return new MockOpenAIClient(apiKey);
  }
  
  // Get models from OpenAI API or cache
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
      const response = await client.models();
      
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
  
  // Map an OpenAI model ID to our AIModel format
  private mapToAIModel(modelId: string): AIModel {
    const mapping = this.modelMappings[modelId];
    
    if (mapping) {
      return {
        id: modelId,
        name: mapping.name,
        provider: this.id,
        capabilities: mapping.capabilities
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
  
  // Format a model ID into a readable name if not in our mappings
  private formatModelName(modelId: string): string {
    return modelId
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  
  // Check if a model is a chat model (not embeddings, whisper, etc)
  private isChatModel(modelId: string): boolean {
    // Simple heuristic: not whisper, not embeddings
    return !modelId.includes('whisper') && !modelId.includes('embedding');
  }
  
  // Validate an API key (very basic implementation)
  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) return false;
    
    try {
      const client = this.createClient(apiKey);
      await client.models();
      return true;
    } catch (error) {
      return false;
    }
  }
}

describe('OpenAI Provider', () => {
  let provider: MockOpenAIProvider;
  
  beforeEach(() => {
    provider = new MockOpenAIProvider();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('getModels', () => {
    it('should return models from the API when given a valid API key', async () => {
      const models = await provider.getModels('valid-api-key');
      
      expect(models.length).toBe(3); // Excludes whisper-1
      expect(models[0].id).toBe('gpt-4');
      expect(models[0].name).toBe('GPT-4');
      expect(models[0].provider).toBe('openai');
      expect(models[0].capabilities.functionCalling).toBe(true);
      
      expect(models[1].id).toBe('gpt-4-vision-preview');
      expect(models[1].capabilities.vision).toBe(true);
      
      expect(models[2].id).toBe('gpt-3.5-turbo');
    });
    
    it('should return default models when no API key is provided', async () => {
      const models = await provider.getModels();
      
      expect(models).toEqual(provider.defaultModels);
      expect(models.length).toBe(2);
      expect(models[0].id).toBe('gpt-4');
      expect(models[1].id).toBe('gpt-3.5-turbo');
    });
    
    it('should format unknown model names correctly', async () => {
      // Mock the client to return an unknown model
      const mockClient = new MockOpenAIClient('valid-api-key');
      vi.spyOn(mockClient, 'models').mockResolvedValue({
        data: [
          {
            id: 'new-test-model',
            object: 'model',
            created: 1677649963,
            owned_by: 'openai'
          }
        ]
      });
      
      vi.spyOn(provider as any, 'createClient').mockReturnValue(mockClient);
      
      const models = await provider.getModels('valid-api-key');
      
      expect(models.length).toBe(1);
      expect(models[0].id).toBe('new-test-model');
      expect(models[0].name).toBe('New Test Model');
    });
    
    it('should filter out non-chat models', async () => {
      const models = await provider.getModels('valid-api-key');
      
      // Check if whisper-1 is not included
      const hasWhisper = models.some(model => model.id === 'whisper-1');
      expect(hasWhisper).toBe(false);
    });
    
    it('should use cached models within TTL period', async () => {
      // First call to populate cache
      await provider.getModels('valid-api-key');
      
      // Spy on createClient to check if it's called again
      const createClientSpy = vi.spyOn(provider as any, 'createClient');
      
      // Second call should use cache
      await provider.getModels('valid-api-key');
      
      expect(createClientSpy).not.toHaveBeenCalled();
    });
  });
  
  describe('validateApiKey', () => {
    it('should return true for a valid API key', async () => {
      const isValid = await provider.validateApiKey('valid-api-key');
      expect(isValid).toBe(true);
    });
    
    it('should return false for an empty API key', async () => {
      const isValid = await provider.validateApiKey('');
      expect(isValid).toBe(false);
    });
    
    it('should return false if the API call fails', async () => {
      // Mock the client to throw an error
      const mockClient = new MockOpenAIClient('invalid-api-key');
      vi.spyOn(mockClient, 'models').mockRejectedValue(new Error('Invalid API key'));
      
      vi.spyOn(provider as any, 'createClient').mockReturnValue(mockClient);
      
      const isValid = await provider.validateApiKey('invalid-api-key');
      expect(isValid).toBe(false);
    });
  });
}); 