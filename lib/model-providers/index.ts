/**
 * Model Providers
 * 
 * This file exports all model providers and initializes the registry.
 */

// Export types
export * from './types';

// Export registry
export { modelRegistry, ModelRegistry } from './registry';

// Export providers
export { openaiProvider, OpenAIProvider } from './openai-provider';
export { anthropicProvider, AnthropicProvider } from './anthropic-provider';

// Import providers
import { modelRegistry } from './registry';
import { openaiProvider } from './openai-provider';
import { anthropicProvider } from './anthropic-provider';

// Register all providers
modelRegistry.registerProvider(openaiProvider);
modelRegistry.registerProvider(anthropicProvider);

/**
 * Get a mapping of provider IDs to names
 * 
 * @returns Record of provider IDs to provider names
 */
export function getProviderOptions(): Record<string, string> {
  const options: Record<string, string> = {};
  
  for (const [id, provider] of modelRegistry.providers.entries()) {
    options[id] = provider.name;
  }
  
  return options;
}

/**
 * Convert a user-friendly model ID to a fully qualified model ID
 * 
 * Some models (like Claude) have versioned IDs that users don't want to type.
 * This function maps user-friendly IDs like 'claude-3-opus' to fully qualified 
 * IDs like 'claude-3-opus-20240229'.
 * 
 * @param modelId User-friendly model ID
 * @param providerId Provider ID
 * @returns Fully qualified model ID
 */
export function getFriendlyModelId(modelId: string, providerId: string): string {
  if (providerId === 'anthropic') {
    return anthropicProvider.getFriendlyModelId(modelId);
  }
  
  // For other providers, return the original ID
  return modelId;
} 