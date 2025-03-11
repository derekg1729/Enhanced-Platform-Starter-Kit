import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'
import { MockNextImage, MockNextLink } from './nextjs-mocks'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/test-path',
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  __esModule: true,
  default: MockNextImage,
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  __esModule: true,
  default: MockNextLink,
}))

// Mock environment variables
process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'localhost:3000'
process.env.NEXTAUTH_URL = 'http://app.localhost:3000'

// Mock database functions
vi.mock('@/lib/user-db', () => ({
  getUserById: vi.fn().mockResolvedValue({
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: null,
    image: null
  }),
  createUser: vi.fn().mockResolvedValue({
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: null,
    image: null
  })
}))

// Mock Vercel Postgres
vi.mock('@vercel/postgres', () => ({
  sql: vi.fn().mockResolvedValue({ rows: [] }),
  db: {
    prepare: vi.fn().mockReturnValue({
      execute: vi.fn().mockResolvedValue({ rows: [] })
    })
  }
}))

// Mock auth functions
vi.mock('@/lib/auth', () => ({
  ensureUserExists: vi.fn().mockResolvedValue(true),
  getSession: vi.fn().mockResolvedValue({
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      image: null
    }
  }),
  authOptions: {
    providers: [],
    callbacks: {},
    pages: {
      signIn: '/login',
      error: '/login'
    },
    session: { strategy: 'jwt' }
  }
}))

// Define agent request type
interface AgentCreateRequest {
  name: string;
  description?: string;
  systemPrompt: string;
  model?: string;
  temperature?: string;
  maxTokens?: number;
}

// Setup MSW handlers
export const handlers = [
  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
      }
    })
  }),
  
  // Agents handlers
  http.get('/api/agents', () => {
    return HttpResponse.json([
      {
        id: 'test-agent-1',
        name: 'Test Agent 1',
        description: 'This is a test agent',
        systemPrompt: 'You are a helpful assistant',
        model: 'gpt-3.5-turbo',
        temperature: '0.7',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'test-user-id',
      },
      {
        id: 'test-agent-2',
        name: 'Test Agent 2',
        description: 'This is another test agent',
        systemPrompt: 'You are a coding assistant',
        model: 'gpt-4',
        temperature: '0.5',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'test-user-id',
      }
    ])
  }),
  
  http.post('/api/agents', async ({ request }) => {
    const data = await request.json() as AgentCreateRequest;
    return HttpResponse.json({
      id: 'new-agent-id',
      name: data.name,
      description: data.description || '',
      systemPrompt: data.systemPrompt,
      model: data.model || 'gpt-3.5-turbo',
      temperature: data.temperature || '0.7',
      maxTokens: data.maxTokens,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'test-user-id',
    }, { status: 201 })
  }),
  
  http.get('/api/agents/:agentId', ({ params }) => {
    const { agentId } = params
    return HttpResponse.json({
      id: agentId,
      name: 'Test Agent',
      description: 'This is a test agent',
      systemPrompt: 'You are a helpful assistant',
      model: 'gpt-3.5-turbo',
      temperature: '0.7',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'test-user-id',
    })
  }),
  
  // API Connections handlers
  http.get('/api/api-connections', () => {
    return HttpResponse.json([
      {
        id: 'test-api-connection-123',
        name: 'Test OpenAI Connection',
        service: 'openai',
        userId: 'test-user-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {}
      }
    ])
  }),
  
  http.get('/api/agents/:agentId/api-connections', ({ params }) => {
    const { agentId } = params
    return HttpResponse.json([
      {
        id: 'test-api-connection-123',
        name: 'Test OpenAI Connection',
        service: 'openai',
        userId: 'test-user-id',
        agentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {}
      }
    ])
  }),
  
  // Add POST handler for API connections
  http.post('/api/api-connections', async ({ request }) => {
    const data = await request.json() as { 
      name?: string; 
      service?: string; 
      metadata?: Record<string, any> 
    };
    return HttpResponse.json({
      id: 'new-api-connection-123',
      name: data.name || 'New API Connection',
      service: data.service || 'openai',
      userId: 'test-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: data.metadata || {}
    }, { status: 201 })
  }),
  
  // Add DELETE handler for API connections
  http.delete('/api/api-connections/:id', ({ params }) => {
    return HttpResponse.json({ success: true })
  }),
  
  // Add PUT handler for API connections
  http.put('/api/api-connections/:id', async ({ params, request }) => {
    const data = await request.json() as { 
      name?: string; 
      service?: string; 
      metadata?: Record<string, any> 
    };
    return HttpResponse.json({
      id: params.id,
      name: data.name || 'Updated API Connection',
      service: data.service || 'openai',
      userId: 'test-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: data.metadata || {}
    })
  }),
]

const server = setupServer(...handlers)

// Start MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers()) 