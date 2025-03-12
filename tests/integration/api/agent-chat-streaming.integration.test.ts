import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/agents/[agentId]/chat/route';
import { getServerSession } from 'next-auth';
import { getAgentById, getApiConnectionsForAgent, createAgentMessage } from '@/lib/agent-db';
import { getUserById } from '@/lib/user-db';
import { ReadableStream } from 'stream/web';
import { createConversation, getConversationById, getConversationMessages, createUserMessage } from '@/lib/conversation-db';

// Import the mocked functions
import { generateChatCompletion } from '@/lib/openai';

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/agent-db', () => ({
  getAgentById: vi.fn(),
  getApiConnectionsForAgent: vi.fn(),
  createAgentMessage: vi.fn(),
}));

vi.mock('@/lib/user-db', () => ({
  getUserById: vi.fn(),
}));

vi.mock('@/lib/openai', () => ({
  generateChatCompletion: vi.fn(),
  OpenAIStream: vi.fn((response) => {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('This is a streaming response'));
        controller.close();
      },
    });
  }),
}));

vi.mock('@/lib/anthropic', () => ({
  generateChatCompletion: vi.fn(),
  AnthropicStream: vi.fn((response) => {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('This is a streaming response'));
        controller.close();
      },
    });
  }),
}));

vi.mock('@/lib/conversation-db', () => ({
  createConversation: vi.fn(),
  getConversationById: vi.fn(),
  getConversationMessages: vi.fn(),
  createUserMessage: vi.fn(),
}));

vi.mock('ai', () => ({
  StreamingTextResponse: vi.fn().mockImplementation((stream, options) => {
    const response = new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        ...options?.headers,
      },
      status: 200,
    });
    
    // Explicitly set the status property
    Object.defineProperty(response, 'status', {
      value: 200,
      writable: false,
    });
    
    return response;
  }),
}));

// Helper to read a stream
async function readStream(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  let result = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += new TextDecoder().decode(value);
  }
  
  return result;
}

describe('Agent Chat API with Streaming', () => {
  const agentId = 'test-agent-123';
  const userId = 'test-user-456';
  const apiConnectionId = 'test-api-connection-789';
  const conversationId = 'test-conversation-123';
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock authentication
    (getServerSession as any).mockResolvedValue({
      user: { id: userId, name: 'Test User', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    
    // Mock user
    (getUserById as any).mockResolvedValue({
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
    });
    
    // Mock agent
    (getAgentById as any).mockResolvedValue({
      id: agentId,
      name: 'Test Agent',
      description: 'A test agent',
      systemPrompt: 'You are a helpful assistant',
      model: 'gpt-3.5-turbo',
      temperature: '0.7',
      maxTokens: 1000,
      userId,
    });
    
    // Mock API connections
    (getApiConnectionsForAgent as any).mockResolvedValue([
      {
        id: apiConnectionId,
        name: 'OpenAI API',
        service: 'openai',
        userId,
      },
    ]);
    
    // Mock message creation
    (createAgentMessage as any).mockResolvedValue({
      id: 'test-message-123',
      agentId,
      userId,
      role: 'user',
      content: 'Test message',
      conversationId,
      createdAt: new Date().toISOString(),
    });

    // Mock conversation functions
    (createConversation as any).mockResolvedValue({
      id: conversationId,
      agentId,
      userId,
      title: 'Test Conversation',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (getConversationById as any).mockResolvedValue({
      id: conversationId,
      agentId,
      userId,
      title: 'Test Conversation',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (getConversationMessages as any).mockResolvedValue([]);

    (createUserMessage as any).mockResolvedValue({
      id: 'test-user-message-123',
      conversationId,
      role: 'user',
      content: 'Test message',
      createdAt: new Date(),
    });
  });
  
  it.skip('should return a streaming response', async () => {
    // Mock OpenAI streaming response
    (generateChatCompletion as any).mockResolvedValue({
      [Symbol.asyncIterator]: async function*() {
        yield { choices: [{ delta: { content: 'This ' } }] };
        yield { choices: [{ delta: { content: 'is ' } }] };
        yield { choices: [{ delta: { content: 'a ' } }] };
        yield { choices: [{ delta: { content: 'streaming ' } }] };
        yield { choices: [{ delta: { content: 'response' } }] };
      },
    });
    
    // Create request
    const request = new NextRequest('http://localhost/api/agents/' + agentId + '/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Test message',
      }),
    });
    
    // Call the API route
    const response = await POST(request, { params: { agentId } });
    
    // Verify response
    expect(response).toBeDefined();
    expect(response.body).toBeDefined();
    
    // The content type might be text/plain or text/event-stream depending on the implementation
    const contentType = response.headers.get('Content-Type');
    expect(contentType).toMatch(/text\/(plain|event-stream)/);
    
    // Read the stream
    const content = await readStream(response.body as ReadableStream);
    expect(content).toContain('This is a streaming response');
    
    // Verify dependencies were called correctly
    expect(getServerSession).toHaveBeenCalled();
    expect(getAgentById).toHaveBeenCalledWith(agentId, userId);
    expect(getApiConnectionsForAgent).toHaveBeenCalledWith(agentId, userId);
    expect(createConversation).toHaveBeenCalled();
    expect(createUserMessage).toHaveBeenCalled();
    expect(generateChatCompletion).toHaveBeenCalledWith(expect.objectContaining({
      apiConnectionId,
      userId,
      model: 'gpt-3.5-turbo',
    }));
  });
  
  it.skip('should handle conversation context', async () => {
    // Mock OpenAI streaming response
    (generateChatCompletion as any).mockResolvedValue({
      [Symbol.asyncIterator]: async function*() {
        yield { choices: [{ delta: { content: 'Response with context' } }] };
      },
    });
    
    // Create request with conversation ID
    const request = new NextRequest('http://localhost/api/agents/' + agentId + '/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Test message',
        conversationId: 'existing-conversation-123',
      }),
    });
    
    // Call the API route
    const response = await POST(request, { params: { agentId } });
    
    // Verify response
    expect(response).toBeDefined();
    expect(response.body).toBeDefined();
    
    // Verify the conversation ID was passed
    expect(getConversationById).toHaveBeenCalledWith('existing-conversation-123');
    expect(createUserMessage).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 'existing-conversation-123',
    }));
  });
  
  it('should handle authentication errors', async () => {
    // Mock unauthenticated session
    (getServerSession as any).mockResolvedValue(null);
    
    // Create request
    const request = new NextRequest('http://localhost/api/agents/' + agentId + '/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Test message',
      }),
    });
    
    // Call the API route
    const response = await POST(request, { params: { agentId } });
    
    // Verify response
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain('Unauthorized');
  });
  
  it('should handle missing API connection', async () => {
    // Mock empty API connections
    (getApiConnectionsForAgent as any).mockResolvedValue([]);
    
    // Create request
    const request = new NextRequest('http://localhost/api/agents/' + agentId + '/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Test message',
      }),
    });
    
    // Call the API route
    const response = await POST(request, { params: { agentId } });
    
    // Verify response
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('No API connections found for this agent');
  });
  
  it('should handle OpenAI API errors', async () => {
    // Mock OpenAI error
    (generateChatCompletion as any).mockRejectedValue(new Error('OpenAI API error'));
    
    // Create request
    const request = new NextRequest('http://localhost/api/agents/' + agentId + '/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Test message',
      }),
    });
    
    // Call the API route
    const response = await POST(request, { params: { agentId } });
    
    // Verify response
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toContain('Failed to generate a response');
  });
}); 