import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAgents, deleteAgent, sendMessage, getAgent } from '@/lib/actions';
import { agents } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Mock the database
vi.mock('@/lib/db', () => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    execute: vi.fn(),
    delete: vi.fn().mockReturnThis(),
  };
  
  return {
    default: mockDb,
    db: mockDb
  };
});

// Mock OpenAI
vi.mock('openai', () => ({
  OpenAI: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'This is a test response',
                role: 'assistant',
              },
              index: 0,
            },
          ],
          id: 'test-completion-id',
        }),
      },
    },
  })),
}));

describe('Agent Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAgents', () => {
    it('should fetch agents for a user', async () => {
      const mockAgents = [
        {
          id: '1',
          name: 'Test Agent 1',
          description: 'This is a test agent',
          model: 'gpt-4',
          userId: 'user-123',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
        {
          id: '2',
          name: 'Test Agent 2',
          description: 'Another test agent',
          model: 'gpt-3.5-turbo',
          userId: 'user-123',
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02'),
        },
      ];

      vi.mocked(vi.mocked(vi.importMock('@/lib/db')).db.execute).mockResolvedValue(mockAgents);

      const result = await getAgents('user-123');

      expect(vi.mocked(vi.importMock('@/lib/db')).db.select).toHaveBeenCalled();
      expect(vi.mocked(vi.importMock('@/lib/db')).db.from).toHaveBeenCalledWith(agents);
      expect(vi.mocked(vi.importMock('@/lib/db')).db.where).toHaveBeenCalled();
      expect(result).toEqual(mockAgents);
    });

    it('should return an empty array if no agents are found', async () => {
      vi.mocked(vi.mocked(vi.importMock('@/lib/db')).db.execute).mockResolvedValue([]);

      const result = await getAgents('user-123');

      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(vi.mocked(vi.importMock('@/lib/db')).db.execute).mockRejectedValue(new Error('Database error'));

      const result = await getAgents('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('getAgent', () => {
    it('should fetch a single agent by ID', async () => {
      const mockAgent = {
        id: 'agent-123',
        name: 'Test Agent',
        description: 'This is a test agent',
        model: 'gpt-4',
        userId: 'user-123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      vi.mocked(vi.mocked(vi.importMock('@/lib/db')).db.execute).mockResolvedValue([mockAgent]);

      const result = await getAgent('agent-123');

      expect(vi.mocked(vi.importMock('@/lib/db')).db.select).toHaveBeenCalled();
      expect(vi.mocked(vi.importMock('@/lib/db')).db.from).toHaveBeenCalledWith(agents);
      expect(vi.mocked(vi.importMock('@/lib/db')).db.where).toHaveBeenCalled();
      expect(result).toEqual(mockAgent);
    });

    it('should return null if agent is not found', async () => {
      vi.mocked(vi.mocked(vi.importMock('@/lib/db')).db.execute).mockResolvedValue([]);

      const result = await getAgent('non-existent-agent');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(vi.mocked(vi.importMock('@/lib/db')).db.execute).mockRejectedValue(new Error('Database error'));

      const result = await getAgent('agent-123');

      expect(result).toBeNull();
    });
  });

  describe('deleteAgent', () => {
    it('should delete an agent and return success', async () => {
      vi.mocked(vi.mocked(vi.importMock('@/lib/db')).db.execute).mockResolvedValue({ rowCount: 1 });

      const result = await deleteAgent('agent-123');

      expect(vi.mocked(vi.importMock('@/lib/db')).db.delete).toHaveBeenCalled();
      expect(vi.mocked(vi.importMock('@/lib/db')).db.from).toHaveBeenCalledWith(agents);
      expect(vi.mocked(vi.importMock('@/lib/db')).db.where).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should return an error if agent deletion fails', async () => {
      vi.mocked(vi.mocked(vi.importMock('@/lib/db')).db.execute).mockResolvedValue({ rowCount: 0 });

      const result = await deleteAgent('agent-123');

      expect(result).toEqual({ error: 'Failed to delete agent' });
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(vi.mocked(vi.importMock('@/lib/db')).db.execute).mockRejectedValue(new Error('Database error'));

      const result = await deleteAgent('agent-123');

      expect(result).toEqual({ error: 'Error: Database error' });
    });
  });

  describe('sendMessage', () => {
    it('should send a message to the agent and return the response', async () => {
      const mockAgent = {
        id: 'agent-123',
        name: 'Test Agent',
        description: 'This is a test agent',
        model: 'gpt-4',
        userId: 'user-123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      // Mock getAgent to return the mock agent
      vi.mocked(vi.mocked(vi.importMock('@/lib/db')).db.execute).mockResolvedValueOnce([mockAgent]);

      const result = await sendMessage('agent-123', 'Hello, agent!');

      expect(result).toEqual({
        id: expect.any(String),
        role: 'assistant',
        content: 'This is a test response',
      });
    });

    it('should return an error message if agent is not found', async () => {
      // Mock getAgent to return null (agent not found)
      vi.mocked(vi.mocked(vi.importMock('@/lib/db')).db.execute).mockResolvedValueOnce([]);

      const result = await sendMessage('non-existent-agent', 'Hello, agent!');

      expect(result).toEqual({
        id: expect.any(String),
        role: 'assistant',
        content: 'Error: Agent not found',
      });
    });

    it('should handle API errors gracefully', async () => {
      const mockAgent = {
        id: 'agent-123',
        name: 'Test Agent',
        description: 'This is a test agent',
        model: 'gpt-4',
        userId: 'user-123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      // Mock getAgent to return the mock agent
      vi.mocked(vi.mocked(vi.importMock('@/lib/db')).db.execute).mockResolvedValueOnce([mockAgent]);

      // Mock OpenAI to throw an error
      const OpenAI = require('openai').OpenAI;
      OpenAI.mockImplementationOnce(() => ({
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(new Error('API error')),
          },
        },
      }));

      const result = await sendMessage('agent-123', 'Hello, agent!');

      expect(result).toEqual({
        id: expect.any(String),
        role: 'assistant',
        content: 'Error: Failed to get response from AI service: Error: API error',
      });
    });
  });
}); 