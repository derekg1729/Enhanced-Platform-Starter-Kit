import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nanoid } from 'nanoid';

// Mock the necessary dependencies
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn().mockResolvedValue({
    user: { id: 'user-123', name: 'Test User', email: 'test@example.com' }
  })
}));

vi.mock('@/lib/actions', () => {
  return {
    getAgent: vi.fn().mockResolvedValue({
      id: 'agent-123',
      name: 'Test Agent',
      description: 'A test agent',
      model: 'claude-3-sonnet',
      userId: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
});

vi.mock('@/lib/db-access', () => ({
  getApiConnectionByService: vi.fn().mockResolvedValue({
    id: 'conn-123',
    name: 'API Connection',
    service: 'anthropic',
    encryptedApiKey: 'encrypted-key-123',
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}));

vi.mock('@/lib/ai-service', () => ({
  createAIService: vi.fn().mockReturnValue({
    generateChatResponse: vi.fn().mockResolvedValue({
      content: 'This is a response from the AI service.'
    })
  })
}));

vi.mock('nanoid', () => ({
  nanoid: vi.fn().mockReturnValue('test-id-123'),
  customAlphabet: vi.fn(() => vi.fn().mockReturnValue('test-id-123')),
}));

// Import dependencies after mocking
import { getSession } from '@/lib/auth';
import { getAgent } from '@/lib/actions';
import { getApiConnectionByService } from '@/lib/db-access';
import { createAIService } from '@/lib/ai-service';

// Import the actual function we want to test
import { sendMessage } from '@/lib/actions';

describe('sendMessage API Service Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should integrate with AI service and return a response', async () => {
    const result = await sendMessage('agent-123', 'Hello, agent!');

    // Check that the dependencies were called with the right arguments
    expect(getSession).toHaveBeenCalled();
    expect(getAgent).toHaveBeenCalledWith('agent-123');
    expect(getApiConnectionByService).toHaveBeenCalledWith('anthropic', 'user-123');
    expect(createAIService).toHaveBeenCalledWith('claude-3-sonnet', 'encrypted-key-123');

    // Check that we got the expected response
    expect(result).toEqual({
      id: 'test-id-123',
      role: 'assistant',
      content: 'This is a response from the AI service.',
    });
  });

  it('should handle errors when the API connection is not found', async () => {
    // Override the getApiConnectionByService mock for this test only
    vi.mocked(getApiConnectionByService).mockResolvedValueOnce(null);

    const result = await sendMessage('agent-123', 'Hello, agent!');

    // Check that we got the expected error
    expect(result).toEqual({
      error: 'No API key found for this model. Please add an API key in your settings.'
    });
  });

  it('should handle errors from the AI service', async () => {
    // Override the createAIService mock for this test only
    vi.mocked(createAIService).mockReturnValueOnce({
      generateChatResponse: vi.fn().mockRejectedValueOnce(new Error('AI service error'))
    });

    const result = await sendMessage('agent-123', 'Hello, agent!');

    // Check that we got the expected error
    expect(result).toEqual({
      error: 'Failed to generate AI response: AI service error'
    });
  });
}); 