import { vi, describe, expect, it, beforeEach, afterEach } from 'vitest';
import { AIModel } from '../../../lib/model-providers/types';

// Mock the entire modules before importing anything else
vi.mock('../../../lib/model-providers', () => ({
  modelRegistry: {
    getModels: vi.fn(),
    providers: new Map([
      ['openai', {}],
      ['anthropic', {}]
    ])
  },
  getFriendlyModelId: vi.fn(),
}));

vi.mock('../../../lib/api-connections', () => ({
  getApiConnection: vi.fn(),
}));

vi.mock('../../../lib/encryption', () => ({
  decrypt: vi.fn(),
}));

// Mock the getAvailableModels function
vi.mock('../../../lib/actions/model-actions', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('../../../lib/actions/model-actions');
  return {
    ...actual,
    // Keep the original implementation but make it spyable
    getAvailableModels: vi.fn(actual.getAvailableModels),
  };
});

// Now import the actions with mocked dependencies
import * as modelActionsModule from '../../../lib/actions/model-actions';
import { modelRegistry, getFriendlyModelId } from '../../../lib/model-providers';
import { getApiConnection } from '../../../lib/api-connections';
import { decrypt } from '../../../lib/encryption';

// Type for API connection
type ApiConnection = {
  id: string;
  name: string;
  service: string;
  userId: string;
  encryptedApiKey: string;
  createdAt: Date;
  updatedAt: Date;
};

// Setup sample data
const openaiModels: AIModel[] = [
  {
    id: 'openai/gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    capabilities: {},
    maxTokens: 8192,
    defaultTemperature: 0.7,
  },
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    capabilities: {},
    maxTokens: 4096,
    defaultTemperature: 0.7,
  },
];

const anthropicModels: AIModel[] = [
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    capabilities: {},
    maxTokens: 100000,
    defaultTemperature: 0.7,
  },
];

describe('Model Actions', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Setup default mock implementations
    vi.mocked(modelRegistry.getModels).mockImplementation((providerId, apiKey) => {
      if (providerId === 'openai') return Promise.resolve(openaiModels);
      if (providerId === 'anthropic') return Promise.resolve(anthropicModels);
      return Promise.resolve([]);
    });
    
    vi.mocked(getFriendlyModelId).mockImplementation((modelId, providerId) => {
      return `${providerId}/${modelId}`;
    });
    
    vi.mocked(getApiConnection).mockResolvedValue({
      id: 'api-connection-1',
      name: 'Test Connection',
      service: 'openai',
      userId: 'user1',
      encryptedApiKey: 'encrypted-key',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ApiConnection);
    
    vi.mocked(decrypt).mockReturnValue('decrypted-api-key');

    // Mock getAvailableModels at the module level
    vi.mocked(modelActionsModule.getAvailableModels).mockImplementation(async (providerId, userId) => {
      if (providerId === 'openai') return openaiModels;
      if (providerId === 'anthropic') return anthropicModels;
      return [];
    });
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getFullModelId', () => {
    it('should convert simple model ID to fully qualified ID', async () => {
      const fullId = await modelActionsModule.getFullModelId('gpt-4', 'openai');
      expect(fullId).toBe('openai/gpt-4');
      expect(getFriendlyModelId).toHaveBeenCalledWith('gpt-4', 'openai');
    });
    
    it('should handle different providers', async () => {
      const fullId = await modelActionsModule.getFullModelId('claude-3-opus', 'anthropic');
      expect(fullId).toBe('anthropic/claude-3-opus');
      expect(getFriendlyModelId).toHaveBeenCalledWith('claude-3-opus', 'anthropic');
    });
  });
  
  describe('getAvailableModels', () => {
    it('should return models for a provider with userId', async () => {
      // Reset the mock to use the real implementation for this test
      vi.mocked(modelActionsModule.getAvailableModels).mockRestore();
      
      const models = await modelActionsModule.getAvailableModels('openai', 'user1');
      
      expect(models).toEqual(openaiModels);
      expect(getApiConnection).toHaveBeenCalledWith('openai', 'user1');
      expect(decrypt).toHaveBeenCalled();
      expect(modelRegistry.getModels).toHaveBeenCalledWith('openai', 'decrypted-api-key');
      
      // Re-mock for subsequent tests
      vi.mocked(modelActionsModule.getAvailableModels).mockImplementation(async (providerId, userId) => {
        if (providerId === 'openai') return openaiModels;
        if (providerId === 'anthropic') return anthropicModels;
        return [];
      });
    });
    
    it('should return models for a provider without userId', async () => {
      // Reset the mock to use the real implementation for this test
      vi.mocked(modelActionsModule.getAvailableModels).mockRestore();
      
      const models = await modelActionsModule.getAvailableModels('openai');
      
      expect(models).toEqual(openaiModels);
      expect(getApiConnection).not.toHaveBeenCalled();
      expect(decrypt).not.toHaveBeenCalled();
      expect(modelRegistry.getModels).toHaveBeenCalledWith('openai');
      
      // Re-mock for subsequent tests
      vi.mocked(modelActionsModule.getAvailableModels).mockImplementation(async (providerId, userId) => {
        if (providerId === 'openai') return openaiModels;
        if (providerId === 'anthropic') return anthropicModels;
        return [];
      });
    });
    
    it('should return default models on error', async () => {
      // Reset the mock to use the real implementation for this test
      vi.mocked(modelActionsModule.getAvailableModels).mockRestore();
      vi.mocked(getApiConnection).mockRejectedValueOnce(new Error('API error'));
      
      const models = await modelActionsModule.getAvailableModels('openai', 'user1');
      
      expect(models).toEqual(openaiModels);
      expect(getApiConnection).toHaveBeenCalledWith('openai', 'user1');
      expect(modelRegistry.getModels).toHaveBeenCalledWith('openai');
      
      // Re-mock for subsequent tests
      vi.mocked(modelActionsModule.getAvailableModels).mockImplementation(async (providerId, userId) => {
        if (providerId === 'openai') return openaiModels;
        if (providerId === 'anthropic') return anthropicModels;
        return [];
      });
    });
  });
  
  describe('getAllAvailableModels', () => {
    it.skip('should return models for all providers', async () => {
      // We need to mock the providers.keys() method to return our test providers
      vi.spyOn(modelRegistry.providers, 'keys').mockReturnValue(
        new Set(['openai', 'anthropic']).keys()
      );
      
      // Set up our getAvailableModels spy - the real function is already mocked
      const getAvailableModelsSpy = vi.spyOn(modelActionsModule, 'getAvailableModels');
      
      // And we need to make it return our mock data for each provider
      getAvailableModelsSpy
        .mockResolvedValueOnce(openaiModels)      // First call for 'openai'
        .mockResolvedValueOnce(anthropicModels);  // Second call for 'anthropic'
      
      // Call the function
      const allModels = await modelActionsModule.getAllAvailableModels('user1');
      
      // Verify the getAvailableModels function was called with the right arguments
      expect(getAvailableModelsSpy).toHaveBeenCalledWith('openai', 'user1');
      expect(getAvailableModelsSpy).toHaveBeenCalledWith('anthropic', 'user1');
      
      // Verify the result contains the expected models
      expect(allModels).toHaveProperty('openai');
      expect(allModels).toHaveProperty('anthropic');
      expect(allModels.openai).toEqual(openaiModels);
      expect(allModels.anthropic).toEqual(anthropicModels);
    });
  });
  
  describe('getModelById', () => {
    it.skip('should convert model ID and find the model', async () => {
      // Create spies on the functions we want to verify
      const getAvailableModelsSpy = vi.spyOn(modelActionsModule, 'getAvailableModels');
      const getFullModelIdSpy = vi.spyOn(modelActionsModule, 'getFullModelId');
      
      // Set up our mocks to return the test data
      getAvailableModelsSpy.mockResolvedValue(openaiModels);
      getFullModelIdSpy.mockResolvedValue('openai/gpt-4');
      
      // Call the function
      const model = await modelActionsModule.getModelById('openai', 'gpt-4', 'user1');
      
      // Verify it was called correctly and returned the expected result
      expect(model).toBeDefined();
      expect(model?.id).toBe('openai/gpt-4');
      expect(getAvailableModelsSpy).toHaveBeenCalledWith('openai', 'user1');
      expect(getFullModelIdSpy).toHaveBeenCalledWith('gpt-4', 'openai');
    });
    
    it.skip('should return undefined if the model is not found', async () => {
      // Create spies on the functions we want to verify
      const getAvailableModelsSpy = vi.spyOn(modelActionsModule, 'getAvailableModels');
      const getFullModelIdSpy = vi.spyOn(modelActionsModule, 'getFullModelId');
      
      // Set up our mocks to return the test data
      getAvailableModelsSpy.mockResolvedValue(openaiModels);
      getFullModelIdSpy.mockResolvedValue('openai/non-existent-model');
      
      // Call the function
      const model = await modelActionsModule.getModelById('openai', 'non-existent-model', 'user1');
      
      // Verify it was called correctly and returned undefined
      expect(model).toBeUndefined();
      expect(getAvailableModelsSpy).toHaveBeenCalledWith('openai', 'user1');
      expect(getFullModelIdSpy).toHaveBeenCalledWith('non-existent-model', 'openai');
    });
  });
}); 