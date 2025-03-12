import { eq, and, desc, inArray } from "drizzle-orm";
import db from "./db";
import {
  agents,
  apiConnections,
  agentApiConnections,
  agentMessages,
  agentFeedback,
  Agent,
  ApiConnection,
  AgentMessage,
  AgentFeedback,
} from "./schema";
import { encryptApiKey, decryptApiKey } from "./api-key-utils";
import { createId } from "@paralleldrive/cuid2";

/**
 * Agent Database Operations
 * 
 * This file provides utility functions for interacting with the agent-related
 * database tables. It includes functions for CRUD operations on agents, API
 * connections, messages, and feedback.
 */

// Agent Operations

/**
 * Creates a new agent
 */
export async function createAgent(
  userId: string,
  data: {
    name: string;
    description?: string;
    systemPrompt: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    apiConnectionId?: string;
  }
): Promise<Agent> {
  // Start a transaction
  return await db.transaction(async (tx) => {
    // Create the agent
    const [agent] = await tx
      .insert(agents)
      .values({
        id: createId(),
        userId,
        name: data.name,
        description: data.description,
        systemPrompt: data.systemPrompt,
        model: data.model,
        temperature: data.temperature?.toString(),
        maxTokens: data.maxTokens,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // If an API connection ID is provided, connect the agent to it
    if (data.apiConnectionId) {
      await tx
        .insert(agentApiConnections)
        .values({
          id: createId(),
          agentId: agent.id,
          apiConnectionId: data.apiConnectionId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
    }

    return agent;
  });
}

/**
 * Gets an agent by ID
 */
export async function getAgentById(id: string, userId: string): Promise<(Agent & { apiConnectionId?: string }) | null> {
  const [agent] = await db
    .select()
    .from(agents)
    .where(and(eq(agents.id, id), eq(agents.userId, userId)));

  if (!agent) {
    return null;
  }

  // Get the API connection for this agent
  const [agentApiConnection] = await db
    .select()
    .from(agentApiConnections)
    .where(eq(agentApiConnections.agentId, id))
    .limit(1);

  return {
    ...agent,
    apiConnectionId: agentApiConnection?.apiConnectionId,
  };
}

/**
 * Gets all agents for a user
 */
export async function getAgentsByUserId(userId: string): Promise<(Agent & { apiConnectionId?: string })[]> {
  const userAgents = await db
    .select()
    .from(agents)
    .where(eq(agents.userId, userId))
    .orderBy(desc(agents.updatedAt));

  if (userAgents.length === 0) {
    return [];
  }

  // Get all API connections for these agents
  const agentIds = userAgents.map(agent => agent.id);
  const apiConnections = await db
    .select()
    .from(agentApiConnections)
    .where(inArray(agentApiConnections.agentId, agentIds));

  // Create a map of agent ID to API connection ID
  const agentConnectionMap = new Map<string, string>();
  for (const connection of apiConnections) {
    agentConnectionMap.set(connection.agentId, connection.apiConnectionId);
  }

  // Add API connection IDs to agents
  return userAgents.map(agent => ({
    ...agent,
    apiConnectionId: agentConnectionMap.get(agent.id),
  }));
}

/**
 * Updates an agent
 */
export async function updateAgent(
  id: string,
  userId: string,
  data: Partial<{
    name: string;
    description: string;
    systemPrompt: string;
    model: string;
    temperature: number;
    maxTokens: number;
    apiConnectionId: string;
  }>
): Promise<Agent | null> {
  return await db.transaction(async (tx) => {
    // First, get the current agent to preserve existing values
    const [currentAgent] = await tx
      .select()
      .from(agents)
      .where(and(eq(agents.id, id), eq(agents.userId, userId)));
    
    if (!currentAgent) {
      return null;
    }
    
    // Create an update object with only the fields that are provided
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };
    
    // Only include fields that are provided in the data object
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.systemPrompt !== undefined) updateData.systemPrompt = data.systemPrompt;
    if (data.model !== undefined) updateData.model = data.model;
    if (data.temperature !== undefined) updateData.temperature = data.temperature.toString();
    if (data.maxTokens !== undefined) updateData.maxTokens = data.maxTokens;
    
    // Update the agent with only the provided fields
    const [agent] = await tx
      .update(agents)
      .set(updateData)
      .where(and(eq(agents.id, id), eq(agents.userId, userId)))
      .returning();

    if (!agent) {
      return null;
    }

    // If API connection ID is provided, update the agent's API connection
    if (data.apiConnectionId) {
      // First, delete any existing connections for this agent
      await tx
        .delete(agentApiConnections)
        .where(eq(agentApiConnections.agentId, id));

      // Then, create a new connection
      await tx
        .insert(agentApiConnections)
        .values({
          id: createId(),
          agentId: id,
          apiConnectionId: data.apiConnectionId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
    }

    return agent;
  });
}

/**
 * Deletes an agent
 */
export async function deleteAgent(id: string, userId: string): Promise<boolean> {
  const [agent] = await db
    .delete(agents)
    .where(and(eq(agents.id, id), eq(agents.userId, userId)))
    .returning();

  return !!agent;
}

// API Connection Operations

/**
 * Creates a new API connection
 */
export async function createApiConnection(
  userId: string,
  data: {
    name: string;
    service: string;
    apiKey: string;
    metadata?: Record<string, any>;
  }
): Promise<ApiConnection> {
  const encryptedApiKey = encryptApiKey(data.apiKey);

  const [connection] = await db
    .insert(apiConnections)
    .values({
      id: createId(),
      userId,
      name: data.name,
      service: data.service,
      apiKey: encryptedApiKey,
      metadata: data.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return connection;
}

/**
 * Gets an API connection by ID
 */
export async function getApiConnectionById(id: string, userId: string): Promise<ApiConnection | null> {
  const [connection] = await db
    .select()
    .from(apiConnections)
    .where(and(eq(apiConnections.id, id), eq(apiConnections.userId, userId)));

  return connection || null;
}

/**
 * Gets all API connections for a user
 */
export async function getApiConnectionsByUserId(userId: string): Promise<ApiConnection[]> {
  return db
    .select()
    .from(apiConnections)
    .where(eq(apiConnections.userId, userId))
    .orderBy(desc(apiConnections.updatedAt));
}

/**
 * Updates an API connection
 */
export async function updateApiConnection(
  id: string,
  userId: string,
  data: Partial<{
    name: string;
    service: string;
    apiKey: string;
    metadata: Record<string, any>;
  }>
): Promise<ApiConnection | null> {
  const updateData: any = { ...data, updatedAt: new Date() };
  
  // If apiKey is provided, encrypt it
  if (data.apiKey) {
    updateData.apiKey = encryptApiKey(data.apiKey);
  }

  const [connection] = await db
    .update(apiConnections)
    .set(updateData)
    .where(and(eq(apiConnections.id, id), eq(apiConnections.userId, userId)))
    .returning();

  return connection || null;
}

/**
 * Deletes an API connection
 */
export async function deleteApiConnection(id: string, userId: string): Promise<boolean> {
  const [connection] = await db
    .delete(apiConnections)
    .where(and(eq(apiConnections.id, id), eq(apiConnections.userId, userId)))
    .returning();

  return !!connection;
}

/**
 * Gets the decrypted API key for a connection
 */
export async function getDecryptedApiKey(id: string, userId: string): Promise<string | null> {
  const connection = await getApiConnectionById(id, userId);
  
  if (!connection) {
    return null;
  }

  try {
    return decryptApiKey(connection.apiKey);
  } catch (error) {
    console.error('Error decrypting API key:', error);
    return null;
  }
}

// Agent-API Connection Operations

/**
 * Associates an API connection with an agent
 */
export async function connectAgentToApi(
  agentId: string,
  apiConnectionId: string,
  userId: string
): Promise<boolean> {
  // Verify that the agent and API connection belong to the user
  const agent = await getAgentById(agentId, userId);
  const connection = await getApiConnectionById(apiConnectionId, userId);

  if (!agent || !connection) {
    return false;
  }

  try {
    await db.insert(agentApiConnections).values({
      id: createId(),
      agentId,
      apiConnectionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error connecting agent to API:', error);
    return false;
  }
}

/**
 * Removes an association between an agent and an API connection
 */
export async function disconnectAgentFromApi(
  agentId: string,
  apiConnectionId: string,
  userId: string
): Promise<boolean> {
  // Verify that the agent belongs to the user
  const agent = await getAgentById(agentId, userId);

  if (!agent) {
    return false;
  }

  const [connection] = await db
    .delete(agentApiConnections)
    .where(
      and(
        eq(agentApiConnections.agentId, agentId),
        eq(agentApiConnections.apiConnectionId, apiConnectionId)
      )
    )
    .returning();

  return !!connection;
}

/**
 * Gets all API connections for an agent
 */
export async function getApiConnectionsForAgent(agentId: string, userId: string): Promise<ApiConnection[]> {
  // Verify that the agent belongs to the user
  const agent = await getAgentById(agentId, userId);

  if (!agent) {
    return [];
  }

  const connections = await db
    .select({
      id: apiConnections.id,
      name: apiConnections.name,
      service: apiConnections.service,
      apiKey: apiConnections.apiKey,
      userId: apiConnections.userId,
      createdAt: apiConnections.createdAt,
      updatedAt: apiConnections.updatedAt,
      metadata: apiConnections.metadata,
    })
    .from(agentApiConnections)
    .innerJoin(
      apiConnections,
      eq(agentApiConnections.apiConnectionId, apiConnections.id)
    )
    .where(eq(agentApiConnections.agentId, agentId));

  return connections;
}

// Agent Message Operations

/**
 * Creates a new message in a conversation with an agent
 */
export async function createAgentMessage(
  data: {
    agentId: string;
    userId: string;
    role: 'user' | 'assistant';
    content: string;
    conversationId: string;
    metadata?: Record<string, any>;
  }
): Promise<AgentMessage> {
  const [message] = await db
    .insert(agentMessages)
    .values({
      id: createId(),
      agentId: data.agentId,
      userId: data.userId,
      role: data.role,
      content: data.content,
      conversationId: data.conversationId,
      metadata: data.metadata,
      createdAt: new Date(),
    })
    .returning();

  return message;
}

/**
 * Gets messages for a conversation
 */
export async function getConversationMessages(
  conversationId: string,
  userId: string
): Promise<AgentMessage[]> {
  return db
    .select()
    .from(agentMessages)
    .where(
      and(
        eq(agentMessages.conversationId, conversationId),
        eq(agentMessages.userId, userId)
      )
    )
    .orderBy(agentMessages.createdAt);
}

/**
 * Gets recent conversations for an agent
 */
export async function getRecentConversations(
  agentId: string,
  userId: string,
  limit: number = 10
): Promise<string[]> {
  const result = await db
    .select({ conversationId: agentMessages.conversationId })
    .from(agentMessages)
    .where(
      and(
        eq(agentMessages.agentId, agentId),
        eq(agentMessages.userId, userId)
      )
    )
    .groupBy(agentMessages.conversationId)
    .orderBy(desc(agentMessages.createdAt))
    .limit(limit);

  return result.map(r => r.conversationId);
}

// Agent Feedback Operations

/**
 * Creates feedback for an agent message
 */
export async function createAgentFeedback(
  data: {
    messageId: string;
    userId: string;
    rating: number;
    comment?: string;
  }
): Promise<AgentFeedback> {
  const [feedback] = await db
    .insert(agentFeedback)
    .values({
      id: createId(),
      messageId: data.messageId,
      userId: data.userId,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date(),
    })
    .returning();

  return feedback;
}

/**
 * Gets feedback for a message
 */
export async function getMessageFeedback(
  messageId: string,
  userId: string
): Promise<AgentFeedback | null> {
  const [feedback] = await db
    .select()
    .from(agentFeedback)
    .where(
      and(
        eq(agentFeedback.messageId, messageId),
        eq(agentFeedback.userId, userId)
      )
    );

  return feedback || null;
}

/**
 * Updates feedback for a message
 */
export async function updateAgentFeedback(
  id: string,
  userId: string,
  data: Partial<{
    rating: number;
    comment: string;
  }>
): Promise<AgentFeedback | null> {
  const [feedback] = await db
    .update(agentFeedback)
    .set(data)
    .where(
      and(
        eq(agentFeedback.id, id),
        eq(agentFeedback.userId, userId)
      )
    )
    .returning();

  return feedback || null;
} 