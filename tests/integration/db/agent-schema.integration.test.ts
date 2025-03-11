import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createId } from '@paralleldrive/cuid2';
import * as schema from '../../../lib/schema';
import { encryptApiKey } from '../../../lib/api-key-utils';

// Mock the database operations
vi.mock('@vercel/postgres', () => ({
  sql: vi.fn().mockImplementation(() => Promise.resolve({ rows: [] })),
}));

vi.mock('drizzle-orm/vercel-postgres', () => ({
  drizzle: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockImplementation(() => Promise.resolve([{ id: 'test-id' }])),
  }),
}));

describe('Agent Schema Tests', () => {
  // Test data
  const testUserId = createId();
  const testAgentId = createId();
  const testApiConnectionId = createId();
  const testAgentApiConnectionId = createId();
  const testMessageId = createId();
  const testFeedbackId = createId();
  const testConversationId = createId();

  // Mock agent data
  const mockAgent = {
    id: testAgentId,
    name: 'Test Agent',
    description: 'A test agent',
    systemPrompt: 'You are a test agent',
    model: 'gpt-3.5-turbo',
    temperature: '0.7',
    maxTokens: 1000,
    userId: testUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock API connection data
  const mockApiConnection = {
    id: testApiConnectionId,
    name: 'Test API Connection',
    service: 'openai',
    apiKey: encryptApiKey('test-api-key'),
    userId: testUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: { test: 'data' },
  };

  // Mock agent-API connection data
  const mockAgentApiConnection = {
    id: testAgentApiConnectionId,
    agentId: testAgentId,
    apiConnectionId: testApiConnectionId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock agent message data
  const mockAgentMessage = {
    id: testMessageId,
    agentId: testAgentId,
    userId: testUserId,
    role: 'user' as const,
    content: 'Hello, agent!',
    conversationId: testConversationId,
    createdAt: new Date(),
    metadata: { test: 'data' },
  };

  // Mock agent feedback data
  const mockAgentFeedback = {
    id: testFeedbackId,
    messageId: testMessageId,
    userId: testUserId,
    rating: 1,
    comment: 'Great response!',
    createdAt: new Date(),
  };

  it('should validate agent schema structure', () => {
    // Verify the agent schema structure
    expect(schema.agents).toBeDefined();
    expect(schema.agents.name).toBeDefined();
    expect(schema.agents.description).toBeDefined();
    expect(schema.agents.systemPrompt).toBeDefined();
    expect(schema.agents.model).toBeDefined();
    expect(schema.agents.temperature).toBeDefined();
    expect(schema.agents.maxTokens).toBeDefined();
    expect(schema.agents.userId).toBeDefined();
    expect(schema.agents.createdAt).toBeDefined();
    expect(schema.agents.updatedAt).toBeDefined();
  });

  it('should validate API connection schema structure', () => {
    // Verify the API connection schema structure
    expect(schema.apiConnections).toBeDefined();
    expect(schema.apiConnections.name).toBeDefined();
    expect(schema.apiConnections.service).toBeDefined();
    expect(schema.apiConnections.apiKey).toBeDefined();
    expect(schema.apiConnections.userId).toBeDefined();
    expect(schema.apiConnections.metadata).toBeDefined();
    expect(schema.apiConnections.createdAt).toBeDefined();
    expect(schema.apiConnections.updatedAt).toBeDefined();
  });

  it('should validate agent-API connection schema structure', () => {
    // Verify the agent-API connection schema structure
    expect(schema.agentApiConnections).toBeDefined();
    expect(schema.agentApiConnections.agentId).toBeDefined();
    expect(schema.agentApiConnections.apiConnectionId).toBeDefined();
    expect(schema.agentApiConnections.createdAt).toBeDefined();
    expect(schema.agentApiConnections.updatedAt).toBeDefined();
  });

  it('should validate agent message schema structure', () => {
    // Verify the agent message schema structure
    expect(schema.agentMessages).toBeDefined();
    expect(schema.agentMessages.agentId).toBeDefined();
    expect(schema.agentMessages.userId).toBeDefined();
    expect(schema.agentMessages.role).toBeDefined();
    expect(schema.agentMessages.content).toBeDefined();
    expect(schema.agentMessages.conversationId).toBeDefined();
    expect(schema.agentMessages.metadata).toBeDefined();
    expect(schema.agentMessages.createdAt).toBeDefined();
  });

  it('should validate agent feedback schema structure', () => {
    // Verify the agent feedback schema structure
    expect(schema.agentFeedback).toBeDefined();
    expect(schema.agentFeedback.messageId).toBeDefined();
    expect(schema.agentFeedback.userId).toBeDefined();
    expect(schema.agentFeedback.rating).toBeDefined();
    expect(schema.agentFeedback.comment).toBeDefined();
    expect(schema.agentFeedback.createdAt).toBeDefined();
  });

  it('should validate schema relations', () => {
    // Verify the schema relations
    expect(schema.agentsRelations).toBeDefined();
    expect(schema.apiConnectionsRelations).toBeDefined();
    expect(schema.agentApiConnectionsRelations).toBeDefined();
    expect(schema.agentMessagesRelations).toBeDefined();
    expect(schema.agentFeedbackRelations).toBeDefined();
  });

  it('should validate type exports in schema file', () => {
    // We can't directly test TypeScript types at runtime
    // Instead, we'll verify that the schema file contains the necessary exports
    // by checking if the schema module has the expected properties
    
    // Verify that the schema module has the expected properties
    expect(Object.keys(schema)).toContain('agents');
    expect(Object.keys(schema)).toContain('apiConnections');
    expect(Object.keys(schema)).toContain('agentApiConnections');
    expect(Object.keys(schema)).toContain('agentMessages');
    expect(Object.keys(schema)).toContain('agentFeedback');
    
    // Verify that the schema module has the expected relations
    expect(Object.keys(schema)).toContain('agentsRelations');
    expect(Object.keys(schema)).toContain('apiConnectionsRelations');
    expect(Object.keys(schema)).toContain('agentApiConnectionsRelations');
    expect(Object.keys(schema)).toContain('agentMessagesRelations');
    expect(Object.keys(schema)).toContain('agentFeedbackRelations');
  });
}); 