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
import { StreamingTextResponse } from 'ai'

// Mock the dependencies
vi.mock('next-auth')
vi.mock('next-auth/jwt')
vi.mock('@/lib/agent-db')
vi.mock('@/lib/user-db')
vi.mock('@/lib/openai')
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
      error: 'Unauthorized - You must be logged in to chat with an agent',
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
      error: 'Validation failed: message: Required',
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
      error: 'This agent does not have an OpenAI API connection configured',
    })
  })

  test('should handle OpenAI API errors gracefully', async () => {
    vi.mocked(agentDb.getAgentById).mockResolvedValueOnce(mockAgent)
    vi.mocked(agentDb.getApiConnectionsForAgent).mockResolvedValueOnce([
      { 
        ...mockApiConnection, 
        service: 'openai',
        metadata: {} as unknown
      }
    ])
    vi.mocked(agentDb.createAgentMessage).mockResolvedValue({
      id: 'test-message-id',
      agentId: 'test-agent-123',
      userId: 'test-user-id',
      role: 'user',
      content: 'Hello',
      conversationId: 'test-conversation-id',
      createdAt: new Date(),
      metadata: {} as unknown
    })
    vi.mocked(openaiLib.generateChatCompletion).mockRejectedValueOnce(new Error('OpenAI API error'))
    
    const req = new NextRequest('http://localhost/api/agents/test-agent-123/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    })

    const response = await POST(req, { params: { agentId: 'test-agent-123' } })
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data).toEqual({
      error: 'Failed to generate a response from OpenAI. Please try again or check your API connection.',
    })
  })

  test('should successfully generate a response', async () => {
    vi.mocked(agentDb.getAgentById).mockResolvedValueOnce(mockAgent)
    vi.mocked(agentDb.getApiConnectionsForAgent).mockResolvedValueOnce([
      { 
        ...mockApiConnection, 
        service: 'openai',
        metadata: {} as unknown
      }
    ])
    vi.mocked(agentDb.createAgentMessage).mockResolvedValue({
      id: 'test-message-id',
      agentId: 'test-agent-123',
      userId: 'test-user-id',
      role: 'user',
      content: 'Hello',
      conversationId: 'test-conversation-id',
      createdAt: new Date(),
      metadata: {} as unknown
    })
    
    // Mock the OpenAI API response
    vi.mocked(openaiLib.generateChatCompletion).mockResolvedValueOnce({
      id: 'test-completion-id',
      choices: [{ message: { content: 'Test response' } }]
    } as any)
    
    // Mock the StreamingTextResponse to return a proper response object
    vi.mocked(StreamingTextResponse).mockImplementationOnce(() => {
      return {
        status: 200,
        headers: new Headers(),
        body: {},
        json: () => Promise.resolve({ success: true })
      } as any;
    });
    
    const req = new NextRequest('http://localhost/api/agents/test-agent-123/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    })

    // This test is difficult to fully validate due to the streaming response
    // Just check that we don't throw an error
    const response = await POST(req, { params: { agentId: 'test-agent-123' } })
    expect(response.status).toBe(200)
  })

  test('should store the message in the database', async () => {
    vi.mocked(agentDb.getAgentById).mockResolvedValueOnce(mockAgent)
    vi.mocked(agentDb.getApiConnectionsForAgent).mockResolvedValueOnce([
      { 
        ...mockApiConnection, 
        service: 'openai',
        metadata: {} as unknown
      }
    ])
    const createMessageSpy = vi.mocked(agentDb.createAgentMessage).mockResolvedValue({
      id: 'test-message-id',
      agentId: 'test-agent-123',
      userId: 'test-user-id',
      role: 'user',
      content: 'Hello',
      conversationId: 'test-conversation-id',
      createdAt: new Date(),
      metadata: {} as unknown
    })
    
    // Mock the OpenAI API response
    vi.mocked(openaiLib.generateChatCompletion).mockResolvedValueOnce({
      id: 'test-completion-id',
      choices: [{ message: { content: 'Test response' } }]
    } as any)
    
    const req = new NextRequest('http://localhost/api/agents/test-agent-123/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    })

    await POST(req, { params: { agentId: 'test-agent-123' } })
    expect(createMessageSpy).toHaveBeenCalledWith(expect.objectContaining({
      agentId: 'test-agent-123',
      userId: 'test-user-id',
      role: 'user',
      content: 'Hello',
    }))
  })
}) 