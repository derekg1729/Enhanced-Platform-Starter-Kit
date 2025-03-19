import db from './db';
import { apiConnections } from './schema';
import { eq, and } from 'drizzle-orm';
import { DrizzleClient } from './db';

/**
 * Get an API connection for a specific provider and user
 * 
 * @param providerId The provider ID (e.g., 'openai', 'anthropic')
 * @param userId The user's ID
 * @returns The API connection or null if not found
 */
export async function getApiConnection(
  providerId: string,
  userId: string
) {
  try {
    // Get the API connection for the user and provider
    const apiConnection = await db.query.apiConnections.findFirst({
      where: (connections, { eq, and }) => 
        and(eq(connections.service, providerId), eq(connections.userId, userId)),
    });
    
    return apiConnection;
  } catch (error) {
    console.error(`Error getting API connection for ${providerId}:`, error);
    return null;
  }
}

/**
 * Get all API connections for a user
 * 
 * @param userId The user's ID
 * @returns Array of API connections
 */
export async function getApiConnectionsForUser(userId: string) {
  try {
    const connections = await db.query.apiConnections.findMany({
      where: (apiConnections, { eq }) => eq(apiConnections.userId, userId),
      orderBy: (apiConnections, { desc }) => [desc(apiConnections.updatedAt)],
    });
    
    return connections;
  } catch (error) {
    console.error('Error getting API connections:', error);
    return [];
  }
} 