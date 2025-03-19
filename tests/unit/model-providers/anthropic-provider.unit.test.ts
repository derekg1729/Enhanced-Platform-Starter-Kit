import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AIModel } from '../../../lib/model-providers/types';

// Mock the Anthropic API client
class MockAnthropicClient {
  apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  // Mock models endpoint - Anthropic doesn't have a models endpoint
  // so we'll simulate one with a fixed list of models
  async listModels() {
    return {
      models: [
        {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          context_window: 200000,
          max_tokens: 4096
        },
        {
          id: 'claude-3-sonnet-20240229',
          name: 'Claude 3 Sonnet',
          context_window: 180000,
          max_tokens: 4096
        },
        {
          id: 'claude-3-haiku-20240307',
          name: 'Claude 3 Haiku',
          context_window: 150000,
          max_tokens: 4096
        },
        {
          id: 'claude-2.1',
          name: 'Claude 2.1',
          context_window: 100000,
          max_tokens: 4096
        },
        {
          id: 'claude-instant-1.2',
          name: 'Claude Instant 1.2',
          context_window: 100000,
          max_tokens: 4096
        }
      ]
    };
  }
  
  // Mock messages.create for API key validation
  async messages() {
    if (this.apiKey !== 'valid-api-key') {
      throw new Error('Invalid API key');
    }
    return {};
  }
}

// Mock the Anthropic provider implementation
class MockAnthropicProvider {
  id = 'anthropic';
  name = 'Anthropic';
  
  // Default models that will be returned if API fails
  defaultModels: AIModel[] = [
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      capabilities: {
        vision: true,
        functionCalling: false
      },
      maxTokens: 4096
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      capabilities: {
        vision: true,
        functionCalling: false
      },
      maxTokens: 4096
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      capabilities: {
        vision: true,
        functionCalling: false
      },
      maxTokens: 4096
    }
  ];
  
  // User-friendly model name mappings
  private modelNameMappings: Record<string, string> = {
    'claude-3-opus-20240229': 'Claude 3 Opus',
    'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
    'claude-3-haiku-20240307': 'Claude 3 Haiku',
    'claude-2.1': 'Claude 2',
    'claude-instant-1.2': 'Claude Instant'
  };
  
  // Model capabilities
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
  
  // Cache for models
  private modelsCache: AIModel[] | null = null;
  private lastFetchTime: number = 0;
  private cacheTTL = 3600000; // 1 hour in milliseconds
  
  // Create Anthropic client
  private createClient(apiKey: string) {
    return new MockAnthropicClient(apiKey);
  }
  
  // Get available models from Anthropic
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
      const response = await client.listModels();
      
      // Transform the API response into our model format
      const models: AIModel[] = response.models.map(model => ({
        id: model.id,
        name: this.modelNameMappings[model.id] || model.name,
        provider: this.id,
        capabilities: this.modelCapabilities[model.id] || {},
        maxTokens: model.max_tokens
      }));
      
      // Cache the models
      this.modelsCache = models;
      this.lastFetchTime = Date.now();
      
      return models;
    } catch (error) {
      console.error('Failed to fetch Anthropic models:', error);
      return this.defaultModels;
    }
  }
  
  // Validate API key
  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) return false;
    
    try {
      const client = this.createClient(apiKey);
      await client.messages();
      return true;
    } catch (error) {
      return false;
    }
  }
  
  // Get a friendly model ID that corrects the common issues
  // with Anthropic model versioning
  getFriendlyModelId(modelId: string): string {
    // Map specific model IDs to their user-friendly versions
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

describe('Anthropic Provider', () => {
  let provider: MockAnthropicProvider;
  
  beforeEach(() => {
    provider = new MockAnthropicProvider();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('getModels', () => {
    it('should return models from the API when given a valid API key', async () => {
      const models = await provider.getModels('valid-api-key');
      
      expect(models.length).toBe(5);
      expect(models[0].id).toBe('claude-3-opus-20240229');
      expect(models[0].name).toBe('Claude 3 Opus');
      expect(models[0].provider).toBe('anthropic');
      expect(models[0].capabilities.vision).toBe(true);
      
      expect(models[1].id).toBe('claude-3-sonnet-20240229');
      expect(models[1].name).toBe('Claude 3 Sonnet');
      
      expect(models[2].id).toBe('claude-3-haiku-20240307');
      expect(models[2].name).toBe('Claude 3 Haiku');
    });
    
    it('should return default models when no API key is provided', async () => {
      const models = await provider.getModels();
      
      expect(models).toEqual(provider.defaultModels);
      expect(models.length).toBe(3);
      expect(models[0].id).toBe('claude-3-opus-20240229');
      expect(models[1].id).toBe('claude-3-sonnet-20240229');
      expect(models[2].id).toBe('claude-3-haiku-20240307');
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
      const isValid = await provider.validateApiKey('invalid-api-key');
      expect(isValid).toBe(false);
    });
  });
  
  describe('getFriendlyModelId', () => {
    it('should map user-friendly model IDs to full model IDs', () => {
      expect(provider.getFriendlyModelId('claude-3-opus')).toBe('claude-3-opus-20240229');
      expect(provider.getFriendlyModelId('claude-3-sonnet')).toBe('claude-3-sonnet-20240229');
      expect(provider.getFriendlyModelId('claude-3-haiku')).toBe('claude-3-haiku-20240307');
      expect(provider.getFriendlyModelId('claude-2')).toBe('claude-2.1');
      expect(provider.getFriendlyModelId('claude-instant-1')).toBe('claude-instant-1.2');
    });
    
    it('should return the original ID if not in the mapping', () => {
      expect(provider.getFriendlyModelId('unknown-model')).toBe('unknown-model');
    });
  });
}); 