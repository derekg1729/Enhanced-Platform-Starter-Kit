import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AIModel, ModelProvider } from '../../../lib/model-providers/types';

// Mock the model registry
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

// Mock provider implementations
class MockOpenAIProvider implements ModelProvider {
  id = 'openai';
  name = 'OpenAI';
  
  async getModels(): Promise<AIModel[]> {
    return [
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
  }
  
  async validateApiKey(apiKey: string): Promise<boolean> {
    return apiKey === 'valid-key';
  }
}

class MockAnthropicProvider implements ModelProvider {
  id = 'anthropic';
  name = 'Anthropic';
  
  async getModels(): Promise<AIModel[]> {
    return [
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        capabilities: {
          vision: true
        }
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        provider: 'anthropic',
        capabilities: {
          vision: true
        }
      }
    ];
  }
  
  async validateApiKey(apiKey: string): Promise<boolean> {
    return apiKey === 'valid-key';
  }
}

// Mock the server actions
const mockServerActions = {
  // Mock action to get available models
  getAvailableModels: async (providerId: string): Promise<AIModel[]> => {
    const registry = new MockModelRegistry();
    registry.registerProvider(new MockOpenAIProvider());
    registry.registerProvider(new MockAnthropicProvider());
    
    return registry.getModels(providerId);
  },
  
  // Mock action to get all available models
  getAllAvailableModels: async (): Promise<Record<string, AIModel[]>> => {
    const registry = new MockModelRegistry();
    registry.registerProvider(new MockOpenAIProvider());
    registry.registerProvider(new MockAnthropicProvider());
    
    return registry.getAllModels();
  }
};

// Mock UI component that uses the server actions to get models
class MockModelSelector {
  private selectedProvider: string = 'openai';
  private selectedModel: string = '';
  private models: AIModel[] = [];
  
  constructor() {
    this.loadModels();
  }
  
  // Load models for the selected provider
  async loadModels(): Promise<void> {
    this.models = await mockServerActions.getAvailableModels(this.selectedProvider);
    
    // Set default selected model if none is selected
    if (!this.selectedModel && this.models.length > 0) {
      this.selectedModel = this.models[0].id;
    }
  }
  
  // Change the selected provider and reload models
  async changeProvider(providerId: string): Promise<void> {
    this.selectedProvider = providerId;
    this.selectedModel = '';
    await this.loadModels();
  }
  
  // Get the list of models for the UI
  getModelOptions(): { value: string, label: string, capabilities: Record<string, boolean> }[] {
    return this.models.map(model => ({
      value: model.id,
      label: model.name,
      capabilities: model.capabilities
    }));
  }
  
  // Get details about the selected model
  getSelectedModelDetails(): AIModel | undefined {
    return this.models.find(model => model.id === this.selectedModel);
  }
  
  // Set the selected model
  setSelectedModel(modelId: string): void {
    this.selectedModel = modelId;
  }
  
  // Check if the selected model has a specific capability
  hasCapability(capability: string): boolean {
    const model = this.getSelectedModelDetails();
    return !!(model?.capabilities && model.capabilities[capability as keyof typeof model.capabilities]);
  }
}

describe('UI Integration with Model Providers', () => {
  let modelSelector: MockModelSelector;
  
  beforeEach(() => {
    modelSelector = new MockModelSelector();
  });
  
  describe('Model Loading', () => {
    it('should load models for the default provider', async () => {
      await modelSelector.loadModels(); // This is called in constructor
      
      const options = modelSelector.getModelOptions();
      expect(options.length).toBe(2);
      expect(options[0].value).toBe('gpt-4');
      expect(options[0].label).toBe('GPT-4');
      expect(options[1].value).toBe('gpt-3.5-turbo');
    });
    
    it('should change models when provider changes', async () => {
      await modelSelector.changeProvider('anthropic');
      
      const options = modelSelector.getModelOptions();
      expect(options.length).toBe(2);
      expect(options[0].value).toBe('claude-3-opus-20240229');
      expect(options[0].label).toBe('Claude 3 Opus');
      expect(options[1].value).toBe('claude-3-sonnet-20240229');
    });
    
    it('should automatically select the first model when provider changes', async () => {
      await modelSelector.changeProvider('anthropic');
      
      const selectedModel = modelSelector.getSelectedModelDetails();
      expect(selectedModel?.id).toBe('claude-3-opus-20240229');
    });
  });
  
  describe('Model Selection', () => {
    it('should allow selecting a model', async () => {
      await modelSelector.loadModels();
      modelSelector.setSelectedModel('gpt-3.5-turbo');
      
      const selectedModel = modelSelector.getSelectedModelDetails();
      expect(selectedModel?.id).toBe('gpt-3.5-turbo');
      expect(selectedModel?.name).toBe('GPT-3.5 Turbo');
    });
    
    it('should return undefined for an invalid model selection', async () => {
      await modelSelector.loadModels();
      modelSelector.setSelectedModel('invalid-model');
      
      const selectedModel = modelSelector.getSelectedModelDetails();
      expect(selectedModel).toBeUndefined();
    });
  });
  
  describe('Capability Detection', () => {
    it('should detect capabilities for OpenAI models', async () => {
      await modelSelector.loadModels();
      modelSelector.setSelectedModel('gpt-4');
      
      expect(modelSelector.hasCapability('functionCalling')).toBe(true);
      expect(modelSelector.hasCapability('vision')).toBe(false);
    });
    
    it('should detect capabilities for Anthropic models', async () => {
      await modelSelector.changeProvider('anthropic');
      modelSelector.setSelectedModel('claude-3-opus-20240229');
      
      expect(modelSelector.hasCapability('vision')).toBe(true);
      expect(modelSelector.hasCapability('functionCalling')).toBe(false);
    });
    
    it('should return false for unknown capabilities', async () => {
      await modelSelector.loadModels();
      modelSelector.setSelectedModel('gpt-4');
      
      expect(modelSelector.hasCapability('unknownCapability')).toBe(false);
    });
  });
}); 