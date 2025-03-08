import { render as rtlRender } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { vi } from 'vitest'
import type { DomainResponse } from '@/lib/types'

// Mock data factories
export const createMockDomain = (overrides = {}): DomainResponse & { error: { code: string; message: string } } => ({
  name: 'test.com',
  apexName: 'test.com',
  projectId: 'test-project',
  verified: false,
  verification: [],
  error: {
    code: 'pending_verification',
    message: 'Domain verification pending'
  },
  ...overrides
})

export const createMockSite = (overrides = {}) => ({
  id: 'site-1',
  name: 'Test Site',
  description: 'A test site',
  subdomain: 'test',
  customDomain: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'user-1',
  ...overrides
})

export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  image: 'https://avatar.vercel.sh/test',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

// Test wrapper with common providers
export const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      {children}
    </SWRConfig>
  )
}

// Custom render method with providers
export const render = (ui: React.ReactElement, options = {}) => {
  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

// Common test environment setup
export const setupTestEnv = () => {
  process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'localhost:3000'
  process.env.POSTGRES_URL = 'postgres://test:test@localhost:5432/test'
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
}

// Mock fetch responses
export const mockFetchResponse = (data: any) => {
  return {
    ok: true,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  }
}

// Common test matchers
export const toHaveLoadingState = (element: HTMLElement) => {
  return {
    pass: element.getAttribute('aria-busy') === 'true',
    message: () => 'expected element to be in loading state'
  }
}

// Mock external services
export const mockVercelAPI = () => {
  const mock = {
    getDomainResponse: vi.fn(),
    verifyDomain: vi.fn(),
  }

  vi.mock('@/lib/vercel', () => ({
    getDomainResponse: mock.getDomainResponse,
    verifyDomain: mock.verifyDomain,
  }))

  return mock
}

// Test database utilities
export const createTestDatabase = async () => {
  // This would typically set up an isolated test database
  // For now, we'll just mock the db client
  return {
    query: {
      sites: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      }
    }
  }
} 