import { AIModel, ModelProvider, ModelProviderRegistry } from './types';

/**
 * Registry for model providers
 * 
 * This class handles registering and retrieving model providers and their models
 */
export class ModelRegistry implements ModelProviderRegistry {
  /** Map of providers by ID */
  readonly providers = new Map<string, ModelProvider>();
  
  /**
   * Register a model provider
   * 
   * @param provider Provider to register
   */
  registerProvider(provider: ModelProvider): void {
    this.providers.set(provider.id, provider);
  }
  
  /**
   * Get a provider by ID
   * 
   * @param id Provider ID
   * @returns Provider or undefined if not found
   */
  getProvider(id: string): ModelProvider | undefined {
    return this.providers.get(id);
  }
  
  /**
   * Get models for a specific provider
   * 
   * @param providerId Provider ID
   * @param apiKey Optional API key to use for fetching models
   * @returns Promise that resolves to an array of models
   */
  async getModels(providerId: string, apiKey?: string): Promise<AIModel[]> {
    const provider = this.getProvider(providerId);
    if (!provider) return [];
    return provider.getModels(apiKey);
  }
  
  /**
   * Get model by ID from a specific provider
   * 
   * @param providerId Provider ID
   * @param modelId Model ID
   * @param apiKey Optional API key to use for fetching models
   * @returns Promise that resolves to the model or undefined if not found
   */
  async getModelById(providerId: string, modelId: string, apiKey?: string): Promise<AIModel | undefined> {
    const models = await this.getModels(providerId, apiKey);
    return models.find(model => model.id === modelId);
  }
  
  /**
   * Get all models from all providers
   * 
   * @param apiKey Optional API key to use for fetching models
   * @returns Promise that resolves to an object mapping provider IDs to arrays of models
   */
  async getAllModels(apiKey?: string): Promise<Record<string, AIModel[]>> {
    const result: Record<string, AIModel[]> = {};
    
    for (const [id, provider] of this.providers.entries()) {
      result[id] = await provider.getModels(apiKey);
    }
    
    return result;
  }
}

// Create and export a singleton instance of the registry
export const modelRegistry = new ModelRegistry(); 