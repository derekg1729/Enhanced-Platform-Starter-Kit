import { describe, test, expect, vi, beforeEach } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/agents/[agentId]/chat/route'
import { getServerSession } from 'next-auth'
import { mockSession } from '@/tests/__helpers__/auth'
import { mockAgent } from '@/tests/__helpers__/agents'
import { mockApiConnection } from '@/tests/__helpers__/api-connections'
import * as agentDb from '@/lib/agent-db'
import * as apiConnectionDb from '@/lib/api-connection-db'
import { OpenAIStream } from '@/lib/openai'

// Mock the dependencies
vi.mock('next-auth')
vi.mock('@/lib/agent-db', () => ({
  getAgentById: vi.fn(),
  createMessage: vi.fn(),
  getDecryptedApiKey: vi.fn(),
  createAgentMessage: vi.fn(),
}))
vi.mock('@/lib/api-connection-db', () => ({
  getApiConnectionById: vi.fn(),
  getApiConnectionsByAgentId: vi.fn(),
}))
vi.mock('@/lib/openai', () => ({
  generateChatCompletion: vi.fn(),
  OpenAIStream: vi.fn(),
}))

describe('Chat API Route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getServerSession).mockResolvedValue(mockSession)
  })

  test('should require authentication', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null)
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'Hello',
      },
    })

    const response = await POST(req, { params: { agentId: 'test-agent-123' } })
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toEqual({
      error: 'Unauthorized',
    })
  })

  test('should require a message in the request body', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
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
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'Hello',
      },
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
    vi.mocked(apiConnectionDb.getApiConnectionsByAgentId).mockResolvedValueOnce([])
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'Hello',
      },
    })

    const response = await POST(req, { params: { agentId: 'test-agent-123' } })
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({
      error: 'Agent requires an OpenAI API connection',
    })
  })

  test('should handle OpenAI API errors gracefully', async () => {
    vi.mocked(agentDb.getAgentById).mockResolvedValueOnce(mockAgent)
    vi.mocked(apiConnectionDb.getApiConnectionsByAgentId).mockResolvedValueOnce([mockApiConnection])
    vi.mocked(OpenAIStream).mockImplementationOnce(() => {
      throw new Error('OpenAI API error');
    })
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'Hello',
      },
    })

    const response = await POST(req, { params: { agentId: 'test-agent-123' } })
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data).toEqual({
      error: 'Failed to generate response',
    })
  })

  test('should successfully generate a response', async () => {
    vi.mocked(agentDb.getAgentById).mockResolvedValueOnce(mockAgent)
    vi.mocked(apiConnectionDb.getApiConnectionsByAgentId).mockResolvedValueOnce([mockApiConnection])
    vi.mocked(OpenAIStream).mockReturnValueOnce(new ReadableStream() as any)
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'Hello',
      },
    })

    const response = await POST(req, { params: { agentId: 'test-agent-123' } })
    expect(response.status).toBe(200)
    expect(response.body).toBeInstanceOf(ReadableStream)
  })

  test('should store the message in the database', async () => {
    vi.mocked(agentDb.getAgentById).mockResolvedValueOnce(mockAgent)
    vi.mocked(apiConnectionDb.getApiConnectionsByAgentId).mockResolvedValueOnce([mockApiConnection])
    vi.mocked(OpenAIStream).mockReturnValueOnce(new ReadableStream() as any)
    const createMessageSpy = vi.spyOn(agentDb, 'createAgentMessage')
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'Hello',
      },
    })

    await POST(req, { params: { agentId: 'test-agent-123' } })
    expect(createMessageSpy).toHaveBeenCalledWith({
      agentId: 'test-agent-123',
      content: 'Hello',
      role: 'user',
      userId: mockSession.user.id,
    })
  })
}) 