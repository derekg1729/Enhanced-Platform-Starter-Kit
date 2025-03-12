import { describe, test, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/agents/[agentId]/chat/route'
import { getServerSession } from 'next-auth'
import { mockSession } from '@/tests/__helpers__/auth'
import { mockAgent } from '@/tests/__helpers__/agents'
import { mockApiConnection } from '@/tests/__helpers__/api-connections'
import * as agentDb from '@/lib/agent-db'
import * as userDb from '@/lib/user-db'
import * as openaiLib from '@/lib/openai'
import * as conversationDb from '@/lib/conversation-db'
import * as modelUtils from '@/lib/model-utils'
import { ModelProvider } from '@/lib/model-utils'
import { StreamingTextResponse } from 'ai'

// Mock the dependencies
vi.mock('next-auth')
vi.mock('next-auth/jwt')
vi.mock('@/lib/agent-db')
vi.mock('@/lib/user-db')
vi.mock('@/lib/openai')
vi.mock('@/lib/conversation-db')
vi.mock('@/lib/model-utils')
vi.mock('ai', () => ({
  StreamingTextResponse: vi.fn().mockImplementation(() => {
    return {
      status: 200,
      headers: new Headers(),
      body: {},
    };
  }),
  OpenAIStream: vi.fn(),
}))

// Enhanced mock API connection with metadata
const enhancedMockApiConnection = {
  ...mockApiConnection,
  metadata: {} as unknown,
};

describe('Chat API Route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(userDb.getUserById).mockResolvedValue({
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: null,
      image: null
    })
    
    // Mock model provider
    vi.mocked(modelUtils.getModelProvider).mockReturnValue(ModelProvider.OPENAI)
    
    // Mock conversation-db functions
    vi.mocked(conversationDb.createConversation).mockResolvedValue({
      id: 'test-conversation-123',
      agentId: 'test-agent-123',
      userId: 'test-user-id',
      title: 'Test Conversation',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    vi.mocked(conversationDb.getConversationById).mockResolvedValue({
      id: 'test-conversation-123',
      agentId: 'test-agent-123',
      userId: 'test-user-id',
      title: 'Test Conversation',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    vi.mocked(conversationDb.getConversationMessages).mockResolvedValue([
      {
        id: 'test-message-1',
        conversationId: 'test-conversation-123',
        role: 'user',
        content: 'Hello',
        createdAt: new Date()
      }
    ])
    
    vi.mocked(conversationDb.createUserMessage).mockResolvedValue({
      id: 'test-message-2',
      conversationId: 'test-conversation-123',
      role: 'user',
      content: 'Hello',
      createdAt: new Date()
    })
  })

  test('should require authentication', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null)
    
    const req = new NextRequest('http://localhost/api/agents/test-agent-123/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    })

    const response = await POST(req, { params: { agentId: 'test-agent-123' } })
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toEqual({
      error: 'Unauthorized',
    })
  })

  test('should require a message in the request body', async () => {
    const req = new NextRequest('http://localhost/api/agents/test-agent-123/chat', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(req, { params: { agentId: 'test-agent-123' } })
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({
      error: 'Message is required',
    })
  })

  test('should verify agent exists and belongs to user', async () => {
    vi.mocked(agentDb.getAgentById).mockResolvedValueOnce(null)
    
    const req = new NextRequest('http://localhost/api/agents/test-agent-123/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    })

    const response = await POST(req, { params: { agentId: 'test-agent-123' } })
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data).toEqual({
      error: 'Agent not found',
    })
  })

  test('should verify agent has an OpenAI API connection', async () => {
    vi.mocked(agentDb.getAgentById).mockResolvedValueOnce(mockAgent)
    vi.mocked(agentDb.getApiConnectionsForAgent).mockResolvedValueOnce([])
    
    const req = new NextRequest('http://localhost/api/agents/test-agent-123/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    })

    const response = await POST(req, { params: { agentId: 'test-agent-123' } })
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({
      error: 'No API connections found for this agent',
    })
  })

  test('should handle OpenAI API errors gracefully', async () => {
    vi.mocked(agentDb.getAgentById).mockResolvedValueOnce({
      ...mockAgent,
      model: 'gpt-3.5-turbo',
    })
    vi.mocked(agentDb.getApiConnectionsForAgent).mockResolvedValueOnce([{
      ...enhancedMockApiConnection,
      service: 'openai',
    }])
    vi.mocked(openaiLib.generateChatCompletion).mockRejectedValueOnce(new Error('OpenAI API error'))
    
    const req = new NextRequest('http://localhost/api/agents/test-agent-123/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    })

    // Log the error but don't fail the test
    console.error = vi.fn()
    
    const response = await POST(req, { params: { agentId: 'test-agent-123' } })
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBeDefined()
  })

  test('should successfully generate a response', async () => {
    vi.mocked(agentDb.getAgentById).mockResolvedValueOnce({
      ...mockAgent,
      model: 'gpt-3.5-turbo',
    })
    vi.mocked(agentDb.getApiConnectionsForAgent).mockResolvedValueOnce([{
      ...enhancedMockApiConnection,
      service: 'openai',
    }])
    
    // Mock the OpenAI generateChatCompletion function with a proper structure
    const mockResponse = {
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Hello, how can I help you?',
          },
        },
      ],
    };
    vi.mocked(openaiLib.generateChatCompletion).mockResolvedValueOnce(mockResponse as any);
    
    // Mock the OpenAI stream with proper type assertion
    const mockStream = new ReadableStream({
      start(controller) {
        controller.close();
      }
    });
    vi.mocked(openaiLib.OpenAIStream).mockReturnValueOnce(mockStream as any);
    
    // Mock the StreamingTextResponse
    vi.mocked(StreamingTextResponse).mockImplementationOnce(() => {
      return {
        status: 200,
        headers: new Headers(),
        body: {},
      } as any;
    });
    
    const req = new NextRequest('http://localhost/api/agents/test-agent-123/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    })

    // Just check that we don't throw an error
    const response = await POST(req, { params: { agentId: 'test-agent-123' } })
    expect(response.status).toBe(200)
  })

  test('should store the message in the database', async () => {
    vi.mocked(agentDb.getAgentById).mockResolvedValueOnce({
      ...mockAgent,
      model: 'gpt-3.5-turbo',
    })
    vi.mocked(agentDb.getApiConnectionsForAgent).mockResolvedValueOnce([{
      ...enhancedMockApiConnection,
      service: 'openai',
    }])
    
    // Mock the OpenAI generateChatCompletion function with a proper structure
    const mockResponse = {
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Hello, how can I help you?',
          },
        },
      ],
    };
    vi.mocked(openaiLib.generateChatCompletion).mockResolvedValueOnce(mockResponse as any);
    
    // Mock the OpenAI stream with proper type assertion
    const mockStream = new ReadableStream({
      start(controller) {
        controller.close();
      }
    });
    vi.mocked(openaiLib.OpenAIStream).mockReturnValueOnce(mockStream as any);
    
    const createUserMessageSpy = vi.mocked(conversationDb.createUserMessage);
    
    const req = new NextRequest('http://localhost/api/agents/test-agent-123/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    })

    await POST(req, { params: { agentId: 'test-agent-123' } })
    
    // Verify that the user message was stored
    expect(createUserMessageSpy).toHaveBeenCalledWith({
      conversationId: 'test-conversation-123',
      content: 'Hello',
    })
  })
}) 