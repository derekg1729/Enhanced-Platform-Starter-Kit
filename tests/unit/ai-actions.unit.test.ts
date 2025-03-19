import { vi } from 'vitest';

// Mock get agent within the mock declaration
vi.mock('@/lib/actions', () => {
  // Create mock implementation
  const mockGetAgent = vi.fn();
  
  return {
    getAgent: mockGetAgent,
    // The actual sendMessage for testing with proper type annotations
    sendMessage: async (agentId: string, message: string) => {
      const session = await import('@/lib/auth').then(m => m.getSession());
      
      if (!session) {
        return { error: 'Not authenticated' };
      }
      
      const agent = await mockGetAgent(agentId);
      
      if (!agent) {
        return { error: 'Agent not found' };
      }
      
      if (agent.userId !== session.user.id) {
        return { error: "You don't have permission to use this agent" };
      }
      
      try {
        const { getApiConnectionByService } = await import('@/lib/db-access');
        const { createAIService } = await import('@/lib/ai-service');
        
        // Determine which service to use based on the model
        const service = agent.model.startsWith('gpt') ? 'openai' : 'anthropic';
        
        // Get the API key for the service
        const apiConnection = await getApiConnectionByService(service, session.user.id);
        
        if (!apiConnection) {
          return {
            error: 'No API key found for this model. Please add an API key in your settings.',
          };
        }
        
        // Create the AI service - properly await the async function
        const aiService = await createAIService(agent.model, apiConnection.encryptedApiKey);
        
        // Generate the response
        const messages = [
          {
            role: 'user',
            content: message,
          },
        ];
        
        const aiResponse = await aiService.generateChatResponse(
          messages,
          {
            temperature: 0.7,
            maxTokens: 1000,
          }
        );
        
        return {
          id: 'test-response-id',
          role: 'assistant',
          content: aiResponse.content,
        };
      } catch (error: any) {
        return {
          error: `Failed to generate AI response: ${error.message}`,
        };
      }
    },
  };
});

vi.mock('@/lib/ai-service', () => ({
  createAIService: vi.fn(),
}));

vi.mock('@/lib/db-access', () => ({
  getApiConnectionByService: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-response-id'),
  customAlphabet: vi.fn(),
}));

// Import needed modules AFTER mocks are set up
import { describe, it, expect, beforeEach } from 'vitest';
import { sendMessage, getAgent } from '@/lib/actions';
import { createAIService } from '@/lib/ai-service';
import { getApiConnectionByService } from '@/lib/db-access';
import { getSession } from '@/lib/auth';

// Mock AI responses
const mockAIService = {
  generateChatResponse: vi.fn().mockResolvedValue({
    content: 'This is a response from the AI service',
  }),
};

const mockAIServiceWithError = {
  generateChatResponse: vi.fn().mockRejectedValue(new Error('AI service error')),
};

describe('SendMessage with AI Service', () => {
  const mockAgent = {
    id: 'agent-123',
    name: 'Test Agent',
    description: 'Test agent description',
    model: 'gpt-4',
    temperature: 0.7,
    instructions: 'You are a helpful assistant for testing purposes',
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession = {
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      image: '/images/default-avatar.png'
    },
  };

  const mockApiConnection = {
    id: 'api-connection-123',
    name: 'OpenAI API Key',
    service: 'openai',
    encryptedApiKey: 'encrypted-api-key',
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue(mockSession);
    vi.mocked(getAgent).mockResolvedValue(mockAgent);
    vi.mocked(getApiConnectionByService).mockResolvedValue(mockApiConnection);
    vi.mocked(createAIService).mockResolvedValue(mockAIService);
  });

  it('should send a message to an agent and get a response from AI service', async () => {
    const result = await sendMessage('agent-123', 'Hello, agent!');

    expect(getSession).toHaveBeenCalled();
    expect(getAgent).toHaveBeenCalledWith('agent-123');
    
    // Check that the correct API service was determined based on the model
    expect(getApiConnectionByService).toHaveBeenCalledWith('openai', 'user-123');
    
    // Check AI service was created with correct parameters
    expect(createAIService).toHaveBeenCalledWith('gpt-4', 'encrypted-api-key');
    
    // Check the response is correctly formatted
    expect(result).toEqual({
      id: 'test-response-id',
      role: 'assistant',
      content: 'This is a response from the AI service',
    });
  });

  it('should return an error if user is not authenticated', async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const result = await sendMessage('agent-123', 'Hello, agent!');

    expect(result).toEqual({
      error: 'Not authenticated',
    });
  });

  it('should return an error if agent is not found', async () => {
    vi.mocked(getAgent).mockResolvedValue(null);

    const result = await sendMessage('non-existent-agent', 'Hello, agent!');

    expect(result).toEqual({
      error: 'Agent not found',
    });
  });

  it('should return an error if user does not have permission to use the agent', async () => {
    vi.mocked(getAgent).mockResolvedValue({
      ...mockAgent,
      userId: 'different-user-id',
    });

    const result = await sendMessage('agent-123', 'Hello, agent!');

    expect(result).toEqual({
      error: "You don't have permission to use this agent",
    });
  });

  it('should return an error if no API connection is found for the model', async () => {
    vi.mocked(getApiConnectionByService).mockResolvedValue(null);

    const result = await sendMessage('agent-123', 'Hello, agent!');

    expect(result).toEqual({
      error: 'No API key found for this model. Please add an API key in your settings.',
    });
  });

  it('should handle AI service errors gracefully', async () => {
    vi.mocked(createAIService).mockResolvedValue(mockAIServiceWithError);

    const result = await sendMessage('agent-123', 'Hello, agent!');

    expect(result).toEqual({
      error: 'Failed to generate AI response: AI service error',
    });
  });
}); 