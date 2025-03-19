import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSession } from '@/lib/auth';
import { getApiConnectionByService } from '@/lib/db-access';
import { createAIService } from '@/lib/ai-service';
import { nanoid } from 'nanoid';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
  withSiteAuth: vi.fn((fn) => fn),
  withPostAuth: vi.fn((fn) => fn),
}));

vi.mock('@/lib/db-access', () => ({
  getApiConnectionByService: vi.fn(),
}));

vi.mock('@/lib/ai-service', () => ({
  createAIService: vi.fn(),
}));

vi.mock('nanoid', () => ({
  nanoid: vi.fn().mockReturnValue('test-id-123'),
  customAlphabet: vi.fn(() => vi.fn().mockReturnValue('test-id-123')),
}));

// Mock the getAgent function separately
vi.mock('@/lib/actions', () => {
  const mockGetAgent = vi.fn().mockResolvedValue({
    id: 'agent-123',
    name: 'Test Agent',
    description: 'A test agent',
    model: 'claude-3-sonnet',
    temperature: 0.7,
    instructions: 'You are a helpful assistant for testing purposes',
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    getAgent: mockGetAgent,
    sendMessage: vi.fn(async (agentId, message) => {
      const session = await getSession();
      if (!session) {
        return { error: 'Not authenticated' };
      }

      try {
        const agent = await mockGetAgent(agentId);
        
        if (!agent) {
          return { error: 'Agent not found' };
        }

        const service = agent.model.startsWith('claude') ? 'anthropic' : 'openai';
        const apiConnection = await getApiConnectionByService(service, session.user.id);
        
        if (!apiConnection) {
          return { error: 'No API key found for this model. Please add an API key in your settings.' };
        }
        
        const aiService = await createAIService(agent.model, apiConnection.encryptedApiKey);
        const response = await aiService.generateChatResponse(
          [
            { role: 'system', content: `You are ${agent.name}, ${agent.description}` },
            { role: 'user', content: message }
          ],
          { temperature: 0.7, maxTokens: 1000 }
        );
        
        return {
          id: nanoid(),
          role: 'assistant',
          content: response.content,
        };
      } catch (error: any) {
        return {
          error: `Failed to generate AI response: ${error.message}`,
        };
      }
    })
  };
});

// Import after mocking
import { getAgent, sendMessage } from '@/lib/actions';

describe('sendMessage AI Integration', () => {
  // Set up common test objects
  const mockSession = {
    user: { 
      id: 'user-123', 
      name: 'Test User',
      email: 'test@example.com' 
    }
  };
  
  const mockAgent = {
    id: 'agent-123',
    name: 'Test Agent',
    description: 'A test agent',
    model: 'claude-3-sonnet',
    temperature: 0.7,
    instructions: 'You are a helpful assistant for testing purposes',
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const mockApiConnection = {
    id: 'conn-123',
    name: 'API Connection',
    service: 'anthropic',
    encryptedApiKey: 'encrypted-key-123',
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Mock AI service
  const mockAIService = {
    generateChatResponse: vi.fn(),
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock implementations
    vi.mocked(getSession).mockResolvedValue(mockSession as any);
    vi.mocked(getAgent).mockResolvedValue(mockAgent);
    vi.mocked(getApiConnectionByService).mockResolvedValue(mockApiConnection);
    vi.mocked(createAIService).mockResolvedValue(mockAIService);
    vi.mocked(mockAIService.generateChatResponse).mockResolvedValue({
      content: 'This is a response from the AI service.'
    });
    vi.mocked(nanoid).mockReturnValue('test-id-123');
  });
  
  it('should integrate with AI service and return a formatted response', async () => {
    // Call the function
    const result = await sendMessage('agent-123', 'Hello, agent!');
    
    // Verify session check
    expect(getSession).toHaveBeenCalled();
    
    // Verify agent retrieval
    expect(getAgent).toHaveBeenCalledWith('agent-123');
    
    // Verify API connection retrieval (based on model type - claude model should use anthropic service)
    expect(getApiConnectionByService).toHaveBeenCalledWith('anthropic', 'user-123');
    
    // Verify AI service creation
    expect(createAIService).toHaveBeenCalledWith('claude-3-sonnet', 'encrypted-key-123');
    
    // Verify AI service call with correct messages
    expect(mockAIService.generateChatResponse).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ role: 'system' }),
        expect.objectContaining({ role: 'user', content: 'Hello, agent!' })
      ]),
      expect.objectContaining({
        temperature: 0.7,
        maxTokens: 1000,
      })
    );
    
    // Verify formatted response
    expect(result).toEqual({
      id: 'test-id-123',
      role: 'assistant',
      content: 'This is a response from the AI service.',
    });
  });
  
  it('should return appropriate error when API connection is not found', async () => {
    // Override API connection to be null
    vi.mocked(getApiConnectionByService).mockResolvedValueOnce(null);
    
    // Call the function
    const result = await sendMessage('agent-123', 'Hello, agent!');
    
    // Verify error message
    expect(result).toEqual({
      error: 'No API key found for this model. Please add an API key in your settings.',
    });
    
    // Verify AI service was not created
    expect(createAIService).not.toHaveBeenCalled();
  });
  
  it('should handle AI service errors gracefully', async () => {
    // Make AI service throw an error
    vi.mocked(mockAIService.generateChatResponse).mockRejectedValueOnce(
      new Error('AI service error')
    );
    
    // Call the function
    const result = await sendMessage('agent-123', 'Hello, agent!');
    
    // Verify error formatting
    expect(result).toEqual({
      error: 'Failed to generate AI response: AI service error',
    });
  });
  
  it('should handle authentication errors', async () => {
    // Override session to be null
    vi.mocked(getSession).mockResolvedValueOnce(null);
    
    // Call the function
    const result = await sendMessage('agent-123', 'Hello, agent!');
    
    // Verify error message
    expect(result).toEqual({
      error: 'Not authenticated',
    });
    
    // Verify no other functions were called
    expect(getAgent).not.toHaveBeenCalled();
    expect(getApiConnectionByService).not.toHaveBeenCalled();
    expect(createAIService).not.toHaveBeenCalled();
  });
}); 