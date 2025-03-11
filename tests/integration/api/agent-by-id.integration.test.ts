import { describe, test, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import * as agentDb from '../../../lib/agent-db';
import { GET, PUT, DELETE } from '../../../app/api/agents/[agentId]/route';

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
vi.mock('../../../lib/agent-db', () => ({
  getAgentById: vi.fn((id: string) => ({
    id,
    name: 'Test Agent',
    userId: 'test-user-id'
  })),
  updateAgent: vi.fn((id: string, userId: string, data: any) => ({
    id,
    ...data,
    userId
  })),
  deleteAgent: vi.fn(() => true)
}));

describe('Agent API Routes', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    },
    expires: '2023-01-01',
  };

  // Create dates for consistent testing
  const createdAt = new Date();
  const updatedAt = new Date();

  const mockAgent = {
    id: 'agent-123',
    userId: 'user-123',
    name: 'Test Agent',
    description: 'A test agent',
    systemPrompt: 'You are a test agent',
    model: 'gpt-4',
    temperature: '0.7',
    maxTokens: 1000,
    createdAt,
    updatedAt,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('GET /api/agents/:agentId returns agent if authenticated and owner', async () => {
    const response = await GET(
      new NextRequest('http://localhost/api/agents/test-agent-id'),
      { params: { agentId: 'test-agent-id' } }
    );
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id', 'test-agent-id');
  });

  test('PUT /api/agents/:agentId updates agent if authenticated and owner', async () => {
    const response = await PUT(
      new NextRequest('http://localhost/api/agents/test-agent-id', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Agent',
          description: 'Updated description',
          systemPrompt: 'Updated prompt',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000
        })
      }),
      { params: { agentId: 'test-agent-id' } }
    );
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('name', 'Updated Agent');
  });

  test('DELETE /api/agents/:agentId deletes agent if authenticated and owner', async () => {
    const response = await DELETE(
      new NextRequest('http://localhost/api/agents/test-agent-id', {
        method: 'DELETE'
      }),
      { params: { agentId: 'test-agent-id' } }
    );
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success', true);
  });
}); 