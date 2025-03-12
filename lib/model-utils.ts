/**
 * Utility functions for working with different model providers
 */

/**
 * Enum for model providers
 */
export enum ModelProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  UNKNOWN = 'unknown',
}

/**
 * Determines the provider for a given model name
 * 
 * @param modelName The name of the model
 * @returns The provider of the model
 */
export function getModelProvider(modelName: string): ModelProvider {
  // Convert to lowercase for case-insensitive matching
  const model = modelName.toLowerCase();
  
  // Check for OpenAI models
  if (model.includes('gpt') || model.includes('davinci') || model.includes('curie') || 
      model.includes('babbage') || model.includes('ada')) {
    return ModelProvider.OPENAI;
  }
  
  // Check for Anthropic models
  if (model.includes('claude')) {
    return ModelProvider.ANTHROPIC;
  }
  
  // Unknown model provider
  return ModelProvider.UNKNOWN;
}

/**
 * Gets the service name for a model provider
 * 
 * @param provider The model provider
 * @returns The service name used in the database
 */
export function getServiceNameForProvider(provider: ModelProvider): string {
  return provider;
} 