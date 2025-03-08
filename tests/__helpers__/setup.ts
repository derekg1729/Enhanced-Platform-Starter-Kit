import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'

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

// Mock environment variables
process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'localhost:3000'
process.env.NEXTAUTH_URL = 'http://app.localhost:3000'

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
]

const server = setupServer(...handlers)

// Start MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers()) 