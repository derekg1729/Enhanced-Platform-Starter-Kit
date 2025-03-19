/**
 * Type definitions for model providers
 * 
 * These types define the interface for working with different AI model providers
 * like OpenAI and Anthropic in a consistent way.
 */

/**
 * Represents an AI model from a provider
 */
export interface AIModel {
  /** Unique identifier for the model */
  id: string;
  
  /** Human-readable name for the model */
  name: string;
  
  /** Provider identifier this model belongs to */
  provider: string;
  
  /** Model capabilities (vision, function calling, etc.) */
  capabilities: Record<string, boolean>;
  
  /** Maximum number of tokens the model supports (optional) */
  maxTokens?: number;
  
  /** Default temperature for the model (optional) */
  defaultTemperature?: number;
}

/**
 * Interface for a model provider
 */
export interface ModelProvider {
  /** Unique identifier for the provider */
  id: string;
  
  /** Human-readable name for the provider */
  name: string;
  
  /**
   * Get available models from this provider
   * 
   * @param apiKey Optional API key to use for fetching models
   * @returns Promise that resolves to an array of models
   */
  getModels(apiKey?: string): Promise<AIModel[]>;
  
  /**
   * Validate an API key for this provider
   * 
   * @param apiKey API key to validate
   * @returns Promise that resolves to true if the key is valid
   */
  validateApiKey(apiKey: string): Promise<boolean>;
}

/**
 * Interface for the model provider registry
 */
export interface ModelProviderRegistry {
  /** Map of providers by ID */
  providers: Map<string, ModelProvider>;
  
  /**
   * Register a model provider
   * 
   * @param provider Provider to register
   */
  registerProvider(provider: ModelProvider): void;
  
  /**
   * Get a provider by ID
   * 
   * @param id Provider ID
   * @returns Provider or undefined if not found
   */
  getProvider(id: string): ModelProvider | undefined;
  
  /**
   * Get models for a specific provider
   * 
   * @param providerId Provider ID
   * @returns Promise that resolves to an array of models
   */
  getModels(providerId: string): Promise<AIModel[]>;
  
  /**
   * Get all models from all providers
   * 
   * @returns Promise that resolves to an object mapping provider IDs to arrays of models
   */
  getAllModels(): Promise<Record<string, AIModel[]>>;
} 