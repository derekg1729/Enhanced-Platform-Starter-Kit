import { db } from './db';
import { agentMessages } from './agent-schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface Conversation {
  id: string;
  agentId: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export async function createConversation({
  agentId,
  userId,
  title,
}: {
  agentId: string;
  userId: string;
  title: string;
}): Promise<Conversation> {
  try {
    console.log(`Creating conversation for agent ${agentId} and user ${userId}`);
    const now = new Date();
    const id = uuidv4();
    
    return {
      id,
      agentId,
      userId,
      title,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

export async function getConversationById(id: string): Promise<Conversation | null> {
  try {
    console.log(`Getting conversation by ID: ${id}`);
    return {
      id,
      agentId: "mock-agent-id",
      userId: "mock-user-id",
      title: "Mock Conversation",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error(`Error getting conversation by ID ${id}:`, error);
    return null;
  }
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  try {
    console.log(`Getting messages for conversation ${conversationId}`);
    const messages = await db.select().from(agentMessages)
      .where(eq(agentMessages.conversationId, conversationId))
      .orderBy(agentMessages.createdAt);
    
    console.log(`Retrieved ${messages.length} messages for conversation ${conversationId}`);
    
    return messages.map(msg => ({
      id: msg.id,
      conversationId: msg.conversationId,
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
      createdAt: msg.createdAt,
    }));
  } catch (error) {
    console.error(`Error getting messages for conversation ${conversationId}:`, error);
    return [];
  }
}

export async function createUserMessage({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
}): Promise<Message> {
  try {
    console.log(`Creating user message in conversation ${conversationId}`);
    const id = uuidv4();
    const now = new Date();
    
    // In a real implementation, we would insert into the database here
    // await db.insert(agentMessages).values({
    //   id,
    //   conversationId,
    //   role: "user",
    //   content,
    //   createdAt: now,
    // });
    
    return {
      id,
      conversationId,
      role: "user",
      content,
      createdAt: now,
    };
  } catch (error) {
    console.error(`Error creating user message in conversation ${conversationId}:`, error);
    throw error;
  }
}

export async function createAssistantMessage({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
}): Promise<Message> {
  try {
    console.log(`Creating assistant message in conversation ${conversationId}`);
    const id = uuidv4();
    const now = new Date();
    
    // In a real implementation, we would insert into the database here
    // await db.insert(agentMessages).values({
    //   id,
    //   conversationId,
    //   role: "assistant",
    //   content,
    //   createdAt: now,
    // });
    
    return {
      id,
      conversationId,
      role: "assistant",
      content,
      createdAt: now,
    };
  } catch (error) {
    console.error(`Error creating assistant message in conversation ${conversationId}:`, error);
    throw error;
  }
} 