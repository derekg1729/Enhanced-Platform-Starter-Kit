import { eq, and } from 'drizzle-orm';
import db from './db';

/**
 * Determines the service provider based on model name
 * 
 * @param model The model name or service identifier
 * @returns The service identifier (openai, anthropic)
 */
function determineServiceFromModel(model: string): 'openai' | 'anthropic' {
  // Check if the model is already a service name
  if (model === 'openai' || model === 'anthropic') {
    return model;
  }
  
  // Check OpenAI models
  if (model.startsWith('gpt-') || model.includes('text-') || model.includes('davinci')) {
    return 'openai';
  }
  
  // Check Anthropic models
  if (model.includes('claude')) {
    return 'anthropic';
  }
  
  // Default to OpenAI if unknown
  return 'openai';
}

/**
 * Get an API connection by service type for a user
 * 
 * @param service The service type or model name (openai, anthropic, gpt-4, claude-3, etc.)
 * @param userId The user's ID
 * @returns The API connection or null if not found
 * @throws If there's a database error
 */
export async function getApiConnectionByService(
  service: string, 
  userId: string
): Promise<Awaited<ReturnType<typeof db.query.apiConnections.findFirst>> | null> {
  // Determine the actual service provider from the model name
  const serviceProvider = determineServiceFromModel(service);
  
  // Get the API connection for the user and service
  const apiConnection = await db.query.apiConnections.findFirst({
    where: (connections, { eq, and }) => 
      and(eq(connections.service, serviceProvider), eq(connections.userId, userId)),
  });
  
  return apiConnection;
} 