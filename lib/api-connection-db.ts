import db from '@/lib/db';
import { apiConnections } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { encrypt, decrypt } from '@/lib/encryption';

export interface ApiConnection {
  id: string;
  name: string;
  type: string;
  userId: string;
  agentId?: string | null;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get an API connection by ID
 */
export async function getApiConnectionById(id: string, userId: string): Promise<ApiConnection | null> {
  const result = await db
    .select()
    .from(apiConnections)
    .where(and(eq(apiConnections.id, id), eq(apiConnections.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Get API connections by user ID
 */
export async function getApiConnectionsByUserId(userId: string): Promise<ApiConnection[]> {
  return db
    .select()
    .from(apiConnections)
    .where(eq(apiConnections.userId, userId));
}

/**
 * Get API connections by agent ID
 */
export async function getApiConnectionsByAgentId(agentId: string, userId: string): Promise<ApiConnection[]> {
  return db
    .select()
    .from(apiConnections)
    .where(and(eq(apiConnections.agentId, agentId), eq(apiConnections.userId, userId)));
}

/**
 * Create a new API connection
 */
export async function createApiConnection(data: Omit<ApiConnection, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiConnection> {
  // Encrypt the API key
  const encryptedApiKey = encrypt(data.apiKey);
  
  const now = new Date();
  const id = crypto.randomUUID();
  
  const result = await db.insert(apiConnections).values({
    id,
    name: data.name,
    type: data.type,
    userId: data.userId,
    agentId: data.agentId,
    apiKey: encryptedApiKey,
    createdAt: now,
    updatedAt: now,
  }).returning();
  
  return result[0];
}

/**
 * Update an API connection
 */
export async function updateApiConnection(id: string, userId: string, data: Partial<Omit<ApiConnection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<ApiConnection | null> {
  const updateData: any = { ...data, updatedAt: new Date() };
  
  // If updating the API key, encrypt it
  if (data.apiKey) {
    updateData.apiKey = encrypt(data.apiKey);
  }
  
  const result = await db
    .update(apiConnections)
    .set(updateData)
    .where(and(eq(apiConnections.id, id), eq(apiConnections.userId, userId)))
    .returning();
  
  return result.length > 0 ? result[0] : null;
}

/**
 * Delete an API connection
 */
export async function deleteApiConnection(id: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(apiConnections)
    .where(and(eq(apiConnections.id, id), eq(apiConnections.userId, userId)))
    .returning({ id: apiConnections.id });
  
  return result.length > 0;
}

/**
 * Get a decrypted API key
 */
export async function getDecryptedApiKey(id: string, userId: string): Promise<string | null> {
  const connection = await getApiConnectionById(id, userId);
  if (!connection) return null;
  
  return decrypt(connection.apiKey);
} 