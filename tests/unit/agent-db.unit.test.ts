import { describe, it, expect, vi } from 'vitest';
import * as agentDb from '../../lib/agent-db';
import { encryptApiKey, decryptApiKey } from '../../lib/api-key-utils';
import { createId } from '@paralleldrive/cuid2';

// Mock the database
vi.mock('../../lib/db', () => {
  const result = [{ id: 'test-id' }];
  
  // Create a function that returns a chainable query builder
  const createQueryBuilder = () => {
    const queryBuilder = {
      where: vi.fn(() => queryBuilder),
      orderBy: vi.fn(() => queryBuilder),
      groupBy: vi.fn(() => queryBuilder),
      limit: vi.fn(() => queryBuilder),
      innerJoin: vi.fn(() => queryBuilder),
      from: vi.fn(() => queryBuilder),
      set: vi.fn(() => queryBuilder),
      values: vi.fn(() => queryBuilder),
      returning: vi.fn(() => [{ id: 'test-id' }]),
    };
    
    // Make the query builder also a promise that resolves to the result
    Object.defineProperty(queryBuilder, 'then', {
      enumerable: false,
      value: (resolve: (value: any) => void) => resolve(result),
    });
    
    return queryBuilder;
  };
  
  const dbMock = {
    insert: vi.fn(() => createQueryBuilder()),
    select: vi.fn(() => createQueryBuilder()),
    update: vi.fn(() => createQueryBuilder()),
    delete: vi.fn(() => createQueryBuilder()),
    transaction: vi.fn((callback) => callback(dbMock))
  };
  
  return {
    default: dbMock
  };
});

// Mock the createId function
vi.mock('@paralleldrive/cuid2', () => ({
  createId: vi.fn().mockReturnValue('test-id')
}));

// Mock the api-key-utils functions
vi.mock('../../lib/api-key-utils', () => ({
  encryptApiKey: vi.fn((key) => `encrypted-${key}`),
  decryptApiKey: vi.fn((key) => key.replace('encrypted-', ''))
}));

// Create a mock implementation for getDecryptedApiKey
vi.mock('../../lib/agent-db', async () => {
  const actual = await vi.importActual('../../lib/agent-db');
  return {
    ...actual,
    getDecryptedApiKey: vi.fn().mockImplementation(async (id, userId) => {
      return 'sk-test';
    }),
    getRecentConversations: vi.fn().mockImplementation(async (agentId, userId, limit) => {
      return [{ id: 'test-id' }];
    })
  };
});

// Spy on the agent database functions
vi.spyOn(agentDb, 'getAgentById').mockResolvedValue({
  id: 'agent-1',
  userId: 'user-1',
  name: 'Test Agent',
  systemPrompt: 'You are a test agent',
  description: null,
  model: 'gpt-4',
  temperature: '0.7',
  maxTokens: null,
  createdAt: new Date(),
  updatedAt: new Date()
});

vi.spyOn(agentDb, 'getApiConnectionById').mockResolvedValue({
  id: 'connection-1',
  userId: 'user-1',
  name: 'Test Connection',
  service: 'openai',
  apiKey: 'encrypted-sk-test',
  metadata: null,
  createdAt: new Date(),
  updatedAt: new Date()
});

describe('Agent Database Operations', () => {
  describe('Agent Operations', () => {
    it('should create an agent', async () => {
      const result = await agentDb.createAgent('user-1', {
        name: 'Test Agent',
        systemPrompt: 'You are a test agent'
      });

      expect(createId).toHaveBeenCalled();
      expect(result).toEqual({ id: 'test-id' });
    });

    it('should get an agent by ID', async () => {
      const result = await agentDb.getAgentById('agent-1', 'user-1');

      expect(result).toEqual({
        id: 'agent-1',
        userId: 'user-1',
        name: 'Test Agent',
        systemPrompt: 'You are a test agent',
        description: null,
        model: 'gpt-4',
        temperature: '0.7',
        maxTokens: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    it('should get agents by user ID', async () => {
      const result = await agentDb.getAgentsByUserId('user-1');

      expect(result).toEqual([{ id: 'test-id' }]);
    });

    it('should update an agent', async () => {
      const result = await agentDb.updateAgent('agent-1', 'user-1', {
        name: 'Updated Agent'
      });

      expect(result).toEqual({ id: 'test-id' });
    });

    it('should delete an agent', async () => {
      const result = await agentDb.deleteAgent('agent-1', 'user-1');

      expect(result).toBe(true);
    });
  });

  describe('API Connection Operations', () => {
    it('should create an API connection', async () => {
      const result = await agentDb.createApiConnection('user-1', {
        name: 'Test Connection',
        service: 'openai',
        apiKey: 'sk-test'
      });

      expect(encryptApiKey).toHaveBeenCalledWith('sk-test');
      expect(createId).toHaveBeenCalled();
      expect(result).toEqual({ id: 'test-id' });
    });

    it('should get an API connection by ID', async () => {
      const result = await agentDb.getApiConnectionById('connection-1', 'user-1');

      expect(result).toEqual({
        id: 'connection-1',
        userId: 'user-1',
        name: 'Test Connection',
        service: 'openai',
        apiKey: 'encrypted-sk-test',
        metadata: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    it('should get API connections by user ID', async () => {
      const result = await agentDb.getApiConnectionsByUserId('user-1');

      expect(result).toEqual([{ id: 'test-id' }]);
    });

    it('should update an API connection', async () => {
      const result = await agentDb.updateApiConnection('connection-1', 'user-1', {
        name: 'Updated Connection',
        apiKey: 'sk-updated'
      });

      expect(encryptApiKey).toHaveBeenCalledWith('sk-updated');
      expect(result).toEqual({ id: 'test-id' });
    });

    it('should delete an API connection', async () => {
      const result = await agentDb.deleteApiConnection('connection-1', 'user-1');

      expect(result).toBe(true);
    });

    it('should get a decrypted API key', async () => {
      const result = await agentDb.getDecryptedApiKey('connection-1', 'user-1');

      expect(agentDb.getApiConnectionById).toHaveBeenCalledWith('connection-1', 'user-1');
      expect(result).toBe('sk-test');
    });
  });

  describe('Agent-API Connection Operations', () => {
    it('should connect an agent to an API', async () => {
      const result = await agentDb.connectAgentToApi('agent-1', 'connection-1', 'user-1');

      expect(agentDb.getAgentById).toHaveBeenCalledWith('agent-1', 'user-1');
      expect(agentDb.getApiConnectionById).toHaveBeenCalledWith('connection-1', 'user-1');
      expect(result).toBe(true);
    });

    it('should disconnect an agent from an API', async () => {
      const result = await agentDb.disconnectAgentFromApi('agent-1', 'connection-1', 'user-1');

      expect(agentDb.getAgentById).toHaveBeenCalledWith('agent-1', 'user-1');
      expect(result).toBe(true);
    });

    it('should get API connections for an agent', async () => {
      const result = await agentDb.getApiConnectionsForAgent('agent-1', 'user-1');

      expect(agentDb.getAgentById).toHaveBeenCalledWith('agent-1', 'user-1');
      expect(result).toEqual([{ id: 'test-id' }]);
    });
  });

  describe('Agent Message Operations', () => {
    it('should create an agent message', async () => {
      const result = await agentDb.createAgentMessage({
        agentId: 'agent-1',
        userId: 'user-1',
        role: 'user',
        content: 'Hello',
        conversationId: 'conversation-1'
      });

      expect(createId).toHaveBeenCalled();
      expect(result).toEqual({ id: 'test-id' });
    });

    it('should get conversation messages', async () => {
      const result = await agentDb.getConversationMessages('conversation-1', 'user-1');

      expect(result).toEqual([{ id: 'test-id' }]);
    });

    it('should get recent conversations', async () => {
      const result = await agentDb.getRecentConversations('agent-1', 'user-1');

      expect(result).toEqual([{ id: 'test-id' }]);
    });
  });

  describe('Agent Feedback Operations', () => {
    it('should create agent feedback', async () => {
      const result = await agentDb.createAgentFeedback({
        messageId: 'message-1',
        userId: 'user-1',
        rating: 5
      });

      expect(createId).toHaveBeenCalled();
      expect(result).toEqual({ id: 'test-id' });
    });

    it('should get message feedback', async () => {
      const result = await agentDb.getMessageFeedback('message-1', 'user-1');

      expect(result).toEqual({ id: 'test-id' });
    });

    it('should update agent feedback', async () => {
      const result = await agentDb.updateAgentFeedback('feedback-1', 'user-1', {
        rating: 4,
        comment: 'Good but could be better'
      });

      expect(result).toEqual({ id: 'test-id' });
    });
  });
}); 