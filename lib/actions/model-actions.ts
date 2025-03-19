'use server';

import { AIModel } from '../model-providers/types';
import { modelRegistry, getFriendlyModelId } from '../model-providers';
import { getApiConnection } from '../api-connections'; 
import { decrypt } from '../encryption';

/**
 * Get all available models for a provider
 * 
 * @param providerId Provider ID
 * @param userId User ID to get API key for
 * @returns Array of models
 */
export async function getAvailableModels(
  providerId: string,
  userId?: string
): Promise<AIModel[]> {
  // If no userId provided, return default models
  if (!userId) {
    return modelRegistry.getModels(providerId);
  }
  
  try {
    // Get API connection for this provider and user
    const apiConnection = await getApiConnection(providerId, userId);
    
    // If no API connection found, return default models
    if (!apiConnection?.encryptedApiKey) {
      return modelRegistry.getModels(providerId);
    }
    
    // Decrypt API key
    const encryptionKey = process.env.ENCRYPTION_KEY || 
      'd2e372921d15fe9312e6d45740ded074a019027122525ec390889154ba85d72f';
    const apiKey = decrypt(apiConnection.encryptedApiKey, encryptionKey);
    
    // Get models with API key
    return modelRegistry.getModels(providerId, apiKey);
  } catch (error) {
    console.error('Error getting available models:', error);
    return modelRegistry.getModels(providerId);
  }
}

/**
 * Get all available models for all providers
 * 
 * @param userId User ID to get API keys for
 * @returns Object mapping provider IDs to arrays of models
 */
export async function getAllAvailableModels(
  userId?: string
): Promise<Record<string, AIModel[]>> {
  const providers = Array.from(modelRegistry.providers.keys());
  const result: Record<string, AIModel[]> = {};
  
  // Get models for each provider
  for (const providerId of providers) {
    result[providerId] = await getAvailableModels(providerId, userId);
  }
  
  return result;
}

/**
 * Convert a user-friendly model ID to a fully qualified model ID
 * 
 * @param modelId User-friendly model ID
 * @param providerId Provider ID
 * @returns Fully qualified model ID
 */
export async function getFullModelId(modelId: string, providerId: string): Promise<string> {
  return getFriendlyModelId(modelId, providerId);
}

/**
 * Get model details by ID
 * 
 * @param providerId Provider ID
 * @param modelId Model ID
 * @param userId User ID to get API key for
 * @returns Model details or undefined if not found
 */
export async function getModelById(
  providerId: string,
  modelId: string,
  userId?: string
): Promise<AIModel | undefined> {
  // Get all models for the provider
  const models = await getAvailableModels(providerId, userId);
  
  // Convert model ID to fully qualified ID
  const fullModelId = await getFullModelId(modelId, providerId);
  
  // Find the model by ID
  return models.find(model => model.id === fullModelId);
} 