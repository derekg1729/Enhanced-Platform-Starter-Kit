import { NextRequest, NextResponse } from 'next/server';
import { vi } from 'vitest';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(() => ({
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com'
    }
  }))
}));

// Mock agent-db functions
vi.mock('@/lib/agent-db', () => ({
  getAgentById: vi.fn((id: string) => ({
    id,
    name: 'Test Agent',
    userId: 'test-user-id'
  })),
  getApiConnectionsForAgent: vi.fn(() => [])
}));

// Helper function to create a mock request
export function createMockRequest(url: string): NextRequest {
  return new NextRequest(url);
}

// Helper function to create route params
export function createRouteParams<T extends Record<string, string>>(params: T) {
  return { params };
}

// Helper function to verify response
export async function verifyResponse(response: NextResponse) {
  const data = await response.json();
  return { status: response.status, data };
} 