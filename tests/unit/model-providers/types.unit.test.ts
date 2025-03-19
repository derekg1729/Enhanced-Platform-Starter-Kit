import { describe, it, expect } from 'vitest';
import type { AIModel, ModelProvider, ModelProviderRegistry } from '../../../lib/model-providers/types';

// Even though we're testing types, we need to create dummy implementations
// to verify the types work as expected
describe('Model Provider Types', () => {
  describe('AIModel', () => {
    it('should allow creating a valid model', () => {
      const model: AIModel = {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai',
        capabilities: {
          vision: true,
          functionCalling: true
        },
        maxTokens: 8192,
        defaultTemperature: 0.7
      };

      expect(model.id).toBe('gpt-4');
      expect(model.name).toBe('GPT-4');
      expect(model.provider).toBe('openai');
      expect(model.capabilities.vision).toBe(true);
      expect(model.capabilities.functionCalling).toBe(true);
      expect(model.maxTokens).toBe(8192);
      expect(model.defaultTemperature).toBe(0.7);
    });

    it('should allow minimal model definition', () => {
      const model: AIModel = {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        capabilities: {},
      };

      expect(model.id).toBe('claude-3-haiku');
      expect(model.name).toBe('Claude 3 Haiku');
      expect(model.provider).toBe('anthropic');
      expect(model.capabilities).toEqual({});
      expect(model.maxTokens).toBeUndefined();
      expect(model.defaultTemperature).toBeUndefined();
    });
  });

  describe('ModelProvider', () => {
    it('should define a valid provider implementation', () => {
      class TestProvider implements ModelProvider {
        id = 'test';
        name = 'Test Provider';
        
        async getModels(): Promise<AIModel[]> {
          return [
            {
              id: 'test-model',
              name: 'Test Model',
              provider: 'test',
              capabilities: {}
            }
          ];
        }
        
        async validateApiKey(apiKey: string): Promise<boolean> {
          return apiKey === 'valid-key';
        }
      }
      
      const provider = new TestProvider();
      expect(provider.id).toBe('test');
      expect(provider.name).toBe('Test Provider');
      expect(typeof provider.getModels).toBe('function');
      expect(typeof provider.validateApiKey).toBe('function');
    });

    it('should allow a provider to return models with capabilities', async () => {
      class TestProvider implements ModelProvider {
        id = 'test';
        name = 'Test Provider';
        
        async getModels(): Promise<AIModel[]> {
          return [
            {
              id: 'basic-model',
              name: 'Basic Model',
              provider: 'test',
              capabilities: {}
            },
            {
              id: 'advanced-model',
              name: 'Advanced Model',
              provider: 'test',
              capabilities: {
                vision: true,
                functionCalling: true
              }
            }
          ];
        }
        
        async validateApiKey(apiKey: string): Promise<boolean> {
          return apiKey === 'valid-key';
        }
      }
      
      const provider = new TestProvider();
      const models = await provider.getModels();
      
      expect(models.length).toBe(2);
      expect(models[0].id).toBe('basic-model');
      expect(models[0].capabilities).toEqual({});
      expect(models[1].id).toBe('advanced-model');
      expect(models[1].capabilities.vision).toBe(true);
      expect(models[1].capabilities.functionCalling).toBe(true);
    });
  });

  describe('ModelProviderRegistry', () => {
    it('should allow registering and retrieving providers', () => {
      // This is just a type test, the actual implementation will be tested elsewhere
      const registry: ModelProviderRegistry = {
        providers: new Map(),
        
        registerProvider(provider: ModelProvider): void {
          this.providers.set(provider.id, provider);
        },
        
        getProvider(id: string): ModelProvider | undefined {
          return this.providers.get(id);
        },
        
        async getModels(providerId: string): Promise<AIModel[]> {
          const provider = this.getProvider(providerId);
          if (!provider) return [];
          return provider.getModels();
        },
        
        async getAllModels(): Promise<Record<string, AIModel[]>> {
          const result: Record<string, AIModel[]> = {};
          
          for (const [id, provider] of this.providers.entries()) {
            result[id] = await provider.getModels();
          }
          
          return result;
        }
      };
      
      class TestProvider implements ModelProvider {
        id = 'test';
        name = 'Test Provider';
        
        async getModels(): Promise<AIModel[]> {
          return [];
        }
        
        async validateApiKey(apiKey: string): Promise<boolean> {
          return true;
        }
      }
      
      registry.registerProvider(new TestProvider());
      expect(registry.providers.size).toBe(1);
      expect(registry.getProvider('test')).toBeDefined();
    });
  });
}); 