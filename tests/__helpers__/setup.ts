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