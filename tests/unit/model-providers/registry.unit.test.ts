import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AIModel, ModelProvider } from '../../../lib/model-providers/types';

// Mock implementation of registry
// The actual implementation will be in lib/model-providers/registry.ts
class MockModelRegistry {
  providers = new Map<string, ModelProvider>();
  
  registerProvider(provider: ModelProvider): void {
    this.providers.set(provider.id, provider);
  }
  
  getProvider(id: string): ModelProvider | undefined {
    return this.providers.get(id);
  }
  
  async getModels(providerId: string): Promise<AIModel[]> {
    const provider = this.getProvider(providerId);
    if (!provider) return [];
    return provider.getModels();
  }
  
  async getAllModels(): Promise<Record<string, AIModel[]>> {
    const result: Record<string, AIModel[]> = {};
    
    for (const [id, provider] of this.providers.entries()) {
      result[id] = await provider.getModels();
    }
    
    return result;
  }
}

// Mock provider classes for testing
class MockProviderA implements ModelProvider {
  id = 'provider-a';
  name = 'Provider A';
  
  async getModels(): Promise<AIModel[]> {
    return [
      {
        id: 'model-a1',
        name: 'Model A1',
        provider: 'provider-a',
        capabilities: {}
      },
      {
        id: 'model-a2',
        name: 'Model A2',
        provider: 'provider-a',
        capabilities: { vision: true }
      }
    ];
  }
  
  async validateApiKey(apiKey: string): Promise<boolean> {
    return apiKey === 'valid-key-a';
  }
}

class MockProviderB implements ModelProvider {
  id = 'provider-b';
  name = 'Provider B';
  
  async getModels(): Promise<AIModel[]> {
    return [
      {
        id: 'model-b1',
        name: 'Model B1',
        provider: 'provider-b',
        capabilities: {}
      }
    ];
  }
  
  async validateApiKey(apiKey: string): Promise<boolean> {
    return apiKey === 'valid-key-b';
  }
}

describe('Model Provider Registry', () => {
  let registry: MockModelRegistry;
  let providerA: MockProviderA;
  let providerB: MockProviderB;
  
  beforeEach(() => {
    registry = new MockModelRegistry();
    providerA = new MockProviderA();
    providerB = new MockProviderB();
    
    // Spy on the getModels methods
    vi.spyOn(providerA, 'getModels');
    vi.spyOn(providerB, 'getModels');
  });
  
  describe('registerProvider', () => {
    it('should register a provider', () => {
      registry.registerProvider(providerA);
      
      expect(registry.providers.size).toBe(1);
      expect(registry.providers.get('provider-a')).toBe(providerA);
    });
    
    it('should register multiple providers', () => {
      registry.registerProvider(providerA);
      registry.registerProvider(providerB);
      
      expect(registry.providers.size).toBe(2);
      expect(registry.providers.get('provider-a')).toBe(providerA);
      expect(registry.providers.get('provider-b')).toBe(providerB);
    });
    
    it('should overwrite a provider with the same ID', () => {
      registry.registerProvider(providerA);
      
      const newProviderA = new MockProviderA();
      registry.registerProvider(newProviderA);
      
      expect(registry.providers.size).toBe(1);
      expect(registry.providers.get('provider-a')).toBe(newProviderA);
    });
  });
  
  describe('getProvider', () => {
    it('should return a registered provider', () => {
      registry.registerProvider(providerA);
      
      const provider = registry.getProvider('provider-a');
      expect(provider).toBe(providerA);
    });
    
    it('should return undefined for an unregistered provider', () => {
      const provider = registry.getProvider('unknown');
      expect(provider).toBeUndefined();
    });
  });
  
  describe('getModels', () => {
    it('should return models from a registered provider', async () => {
      registry.registerProvider(providerA);
      
      const models = await registry.getModels('provider-a');
      
      expect(providerA.getModels).toHaveBeenCalledTimes(1);
      expect(models.length).toBe(2);
      expect(models[0].id).toBe('model-a1');
      expect(models[1].id).toBe('model-a2');
    });
    
    it('should return an empty array for an unregistered provider', async () => {
      const models = await registry.getModels('unknown');
      
      expect(models).toEqual([]);
    });
  });
  
  describe('getAllModels', () => {
    it('should return models from all registered providers', async () => {
      registry.registerProvider(providerA);
      registry.registerProvider(providerB);
      
      const allModels = await registry.getAllModels();
      
      expect(providerA.getModels).toHaveBeenCalledTimes(1);
      expect(providerB.getModels).toHaveBeenCalledTimes(1);
      
      expect(Object.keys(allModels).length).toBe(2);
      expect(allModels['provider-a'].length).toBe(2);
      expect(allModels['provider-b'].length).toBe(1);
      
      expect(allModels['provider-a'][0].id).toBe('model-a1');
      expect(allModels['provider-a'][1].id).toBe('model-a2');
      expect(allModels['provider-b'][0].id).toBe('model-b1');
    });
    
    it('should return an empty object when no providers are registered', async () => {
      const allModels = await registry.getAllModels();
      
      expect(Object.keys(allModels).length).toBe(0);
    });
  });
}); 