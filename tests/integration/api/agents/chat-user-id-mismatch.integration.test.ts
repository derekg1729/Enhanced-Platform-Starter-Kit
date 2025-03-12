import { describe, test, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/agents/[agentId]/chat/route'
import { getServerSession } from 'next-auth'
import * as agentDb from '@/lib/agent-db'
import * as userDb from '@/lib/user-db'
import * as openaiLib from '@/lib/openai'
import * as conversationDb from '@/lib/conversation-db'

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/agent-db', () => ({
  getAgentById: vi.fn(),
  getApiConnectionsForAgent: vi.fn(),
  createAgentMessage: vi.fn(),
  getDecryptedApiKey: vi.fn(),
}))

vi.mock('@/lib/user-db', () => ({
  getUserById: vi.fn(),
  getUserByEmail: vi.fn(),
}))

vi.mock('@/lib/openai', () => ({
  generateChatCompletion: vi.fn(),
  OpenAIStream: vi.fn(),
}))

vi.mock('@/lib/conversation-db', () => ({
  createConversation: vi.fn(),
  getConversationById: vi.fn(),
  getConversationMessages: vi.fn(),
  createUserMessage: vi.fn(),
  createAssistantMessage: vi.fn(),
}))

vi.mock('ai', () => ({
  StreamingTextResponse: vi.fn().mockImplementation((stream) => {
    const response = {
      status: 200,
      headers: new Map(),
      body: stream,
      json: () => Promise.resolve({}),
    };
    
    // Make the status property accessible via normal property access
    Object.defineProperty(response, 'status', {
      configurable: true,
      enumerable: true,
      get: () => 200
    });
    
    return response;
  }),
}))

describe('Chat API User ID Mismatch', () => {
  const mockAgent = {
    id: 'test-agent-id',
    name: 'Test Agent',
    description: 'Test agent description',
    systemPrompt: 'You are a helpful assistant',
    model: 'gpt-3.5-turbo',
    temperature: '0.7',
    maxTokens: 1024,
    userId: 'test-user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockOpenAIConnection = {
    id: 'openai-connection-id',
    name: 'OpenAI Connection',
    service: 'openai',
    apiKey: 'encrypted-api-key',
    userId: 'test-user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {},
  }

  const mockConversation = {
    id: 'test-conversation-id',
    agentId: 'test-agent-id',
    userId: 'test-user-id',
    title: 'Test conversation',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.resetAllMocks()

    // Mock conversation
    vi.mocked(conversationDb.createConversation).mockResolvedValue(mockConversation)
    vi.mocked(conversationDb.getConversationMessages).mockResolvedValue([])
    vi.mocked(conversationDb.createUserMessage).mockResolvedValue({
      id: 'test-message-id',
      conversationId: 'test-conversation-id',
      role: 'user',
      content: 'Hello',
      createdAt: new Date(),
    })
  })

  test('should fail when session user ID is email but database expects ID', async () => {
    // Mock session with email but no ID
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/image.jpg',
        // No ID provided
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    // Mock getUserByEmail to return null (user not found)
    vi.mocked(userDb.getUserByEmail).mockResolvedValue(null)

    // Mock agent not found because user ID mismatch
    vi.mocked(agentDb.getAgentById).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/agents/test-agent-id/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    })

    const response = await POST(request, { params: { agentId: 'test-agent-id' } })
    expect(response.status).toBe(404)
    
    const responseData = await response.json()
    expect(responseData.error).toBe('Agent not found')

    // Verify getUserByEmail was called with the email
    expect(userDb.getUserByEmail).toHaveBeenCalledWith('test@example.com')

    // Verify getAgentById was called with email instead of ID
    expect(agentDb.getAgentById).toHaveBeenCalledWith('test-agent-id', 'test@example.com')
  })

  test('should succeed when session has user ID and it matches database', async () => {
    // Mock session with proper ID
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/image.jpg',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    // Mock agent found because user ID matches
    vi.mocked(agentDb.getAgentById).mockResolvedValue(mockAgent)
    vi.mocked(agentDb.getApiConnectionsForAgent).mockResolvedValue([mockOpenAIConnection])
    vi.mocked(agentDb.getDecryptedApiKey).mockResolvedValue('decrypted-api-key')

    // Mock OpenAI response
    vi.mocked(openaiLib.generateChatCompletion).mockResolvedValue({} as any)
    vi.mocked(openaiLib.OpenAIStream).mockReturnValue(new ReadableStream() as any)

    const request = new NextRequest('http://localhost:3000/api/agents/test-agent-id/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    })

    await POST(request, { params: { agentId: 'test-agent-id' } })

    // Verify getUserByEmail was not called
    expect(userDb.getUserByEmail).not.toHaveBeenCalled()

    // Verify getAgentById was called with proper ID
    expect(agentDb.getAgentById).toHaveBeenCalledWith('test-agent-id', 'test-user-id')
    
    // Verify that the API connection was retrieved
    expect(agentDb.getApiConnectionsForAgent).toHaveBeenCalledWith('test-agent-id', 'test-user-id')
  })

  test('should look up user by email and use the correct ID', async () => {
    // Mock session with email but no ID
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/image.jpg',
        // No ID provided
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    // Mock getUserByEmail to return user with ID
    vi.mocked(userDb.getUserByEmail).mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      image: 'https://example.com/image.jpg',
    } as any)

    // Mock agent found because user ID matches
    vi.mocked(agentDb.getAgentById).mockResolvedValue(mockAgent)
    vi.mocked(agentDb.getApiConnectionsForAgent).mockResolvedValue([mockOpenAIConnection])
    vi.mocked(agentDb.getDecryptedApiKey).mockResolvedValue('decrypted-api-key')

    // Mock OpenAI response
    vi.mocked(openaiLib.generateChatCompletion).mockResolvedValue({} as any)
    vi.mocked(openaiLib.OpenAIStream).mockReturnValue(new ReadableStream() as any)

    const request = new NextRequest('http://localhost:3000/api/agents/test-agent-id/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    })

    await POST(request, { params: { agentId: 'test-agent-id' } })

    // Verify getUserByEmail was called with the email
    expect(userDb.getUserByEmail).toHaveBeenCalledWith('test@example.com')

    // Verify getAgentById was called with the correct ID from the database
    expect(agentDb.getAgentById).toHaveBeenCalledWith('test-agent-id', 'test-user-id')
    
    // Verify that the API connection was retrieved
    expect(agentDb.getApiConnectionsForAgent).toHaveBeenCalledWith('test-agent-id', 'test-user-id')
  })
}) 