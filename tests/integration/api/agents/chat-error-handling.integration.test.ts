import { describe, test, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/agents/[agentId]/chat/route'
import { getServerSession } from 'next-auth'
import * as agentDb from '@/lib/agent-db'
import * as userDb from '@/lib/user-db'
import * as openaiLib from '@/lib/openai'
import * as anthropicLib from '@/lib/anthropic'
import * as conversationDb from '@/lib/conversation-db'
import * as modelUtils from '@/lib/model-utils'

// Define ModelProvider enum here to avoid import issues
enum ModelProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  UNKNOWN = 'unknown',
}

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
}))

vi.mock('@/lib/openai', () => ({
  generateChatCompletion: vi.fn(),
  OpenAIStream: vi.fn(),
}))

vi.mock('@/lib/anthropic', () => ({
  generateChatCompletion: vi.fn(),
  AnthropicStream: vi.fn(),
}))

vi.mock('@/lib/conversation-db', () => ({
  createConversation: vi.fn(),
  getConversationById: vi.fn(),
  getConversationMessages: vi.fn(),
  createUserMessage: vi.fn(),
  createAssistantMessage: vi.fn(),
}))

vi.mock('@/lib/model-utils', () => ({
  getModelProvider: vi.fn(),
  ModelProvider: {
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic',
    UNKNOWN: 'unknown',
  },
}))

vi.mock('ai', () => ({
  StreamingTextResponse: vi.fn().mockImplementation((stream) => {
    return {
      status: 200,
      headers: new Map(),
      body: stream,
    }
  }),
}))

describe('Chat API Error Handling', () => {
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

  const mockAnthropicConnection = {
    id: 'anthropic-connection-id',
    name: 'Anthropic Connection',
    service: 'anthropic',
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

    // Mock session
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    // Mock agent
    vi.mocked(agentDb.getAgentById).mockResolvedValue(mockAgent)

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

    // Mock model provider
    vi.mocked(modelUtils.getModelProvider).mockReturnValue('openai' as any)
  })

  test('should handle missing API connection for model provider', async () => {
    // Mock API connections to return empty array
    vi.mocked(agentDb.getApiConnectionsForAgent).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/agents/test-agent-id/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    })

    const response = await POST(request, { params: { agentId: 'test-agent-id' } })
    expect(response.status).toBe(400)
    
    const responseData = await response.json()
    expect(responseData.error).toBe('No API connections found for this agent')
  })

  test('should handle API connection service mismatch with model provider', async () => {
    // Mock API connections to return a connection with a different service
    vi.mocked(agentDb.getApiConnectionsForAgent).mockResolvedValue([
      {
        id: 'anthropic-connection-id',
        name: 'Anthropic Connection',
        service: 'anthropic',
        apiKey: 'encrypted-api-key',
        userId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      }
    ])

    // Set model provider to OpenAI but disable the fallback mechanism
    vi.mocked(modelUtils.getModelProvider).mockReturnValue('openai' as any)
    
    // Mock OpenAI to throw an error when using the wrong connection
    vi.mocked(openaiLib.generateChatCompletion).mockRejectedValue(new Error('Failed to generate OpenAI response'))

    const request = new NextRequest('http://localhost:3000/api/agents/test-agent-id/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    })

    const response = await POST(request, { params: { agentId: 'test-agent-id' } })
    expect(response.status).toBe(500)
    
    const responseData = await response.json()
    expect(responseData.error).toBe('Failed to generate a response. Please try again or check your API connection.')
  })

  test('should handle OpenAI API errors gracefully', async () => {
    // Mock API connections to return an OpenAI connection
    vi.mocked(agentDb.getApiConnectionsForAgent).mockResolvedValue([mockOpenAIConnection])

    // Mock OpenAI to throw an error
    vi.mocked(openaiLib.generateChatCompletion).mockRejectedValue(new Error('OpenAI API error'))

    const request = new NextRequest('http://localhost:3000/api/agents/test-agent-id/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    })

    const response = await POST(request, { params: { agentId: 'test-agent-id' } })
    expect(response.status).toBe(500)
    
    const responseData = await response.json()
    expect(responseData.error).toBe('Failed to generate a response. Please try again or check your API connection.')
  })

  test('should handle Anthropic API errors gracefully', async () => {
    // Mock API connections to return an Anthropic connection
    vi.mocked(agentDb.getApiConnectionsForAgent).mockResolvedValue([mockAnthropicConnection])

    // Set model provider to Anthropic
    vi.mocked(modelUtils.getModelProvider).mockReturnValue('anthropic' as any)

    // Mock Anthropic to throw an error
    vi.mocked(anthropicLib.generateChatCompletion).mockRejectedValue(new Error('Anthropic API error'))

    const request = new NextRequest('http://localhost:3000/api/agents/test-agent-id/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    })

    const response = await POST(request, { params: { agentId: 'test-agent-id' } })
    expect(response.status).toBe(500)
    
    const responseData = await response.json()
    expect(responseData.error).toBe('Failed to generate a response. Please try again or check your API connection.')
  })

  test('should handle decryption errors for API keys', async () => {
    // Mock API connections to return an OpenAI connection
    vi.mocked(agentDb.getApiConnectionsForAgent).mockResolvedValue([mockOpenAIConnection])

    // Mock OpenAI to throw a specific error about API keys
    vi.mocked(openaiLib.generateChatCompletion).mockRejectedValue(new Error('API key not found or could not be decrypted'))

    const request = new NextRequest('http://localhost:3000/api/agents/test-agent-id/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    })

    const response = await POST(request, { params: { agentId: 'test-agent-id' } })
    expect(response.status).toBe(401)
    
    const responseData = await response.json()
    expect(responseData.error).toBe('Invalid API key. Please check your API connection settings.')
  })
}) 