import { describe, test, expect } from 'vitest';
import { getAgent, getAgentApiConnections } from '@/tests/__mocks__/route-handlers';
import { createMockRequest, createRouteParams, verifyResponse } from '@/tests/__helpers__/route-handlers';

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
vi.mock('../../../../lib/agent-db', () => ({
  getAgentById: vi.fn((id: string) => ({
    id,
    name: 'Test Agent',
    userId: 'test-user-id'
  })),
  getApiConnectionsForAgent: vi.fn(() => [])
}));

describe('Agent Route Parameter Naming', () => {
  test('agent routes should handle the same parameter name consistently', async () => {
    // Test the agent GET endpoint
    const agentResponse = await getAgent(
      createMockRequest('http://localhost/api/agents/test-agent-id'),
      createRouteParams({ agentId: 'test-agent-id' })
    );
    const { status: agentStatus, data: agentData } = await verifyResponse(agentResponse);
    
    // Test the agent API connections endpoint
    const connectionsResponse = await getAgentApiConnections(
      createMockRequest('http://localhost/api/agents/test-agent-id/api-connections'),
      createRouteParams({ agentId: 'test-agent-id' })
    );
    const { status: connectionsStatus } = await verifyResponse(connectionsResponse);

    // Verify both endpoints successfully processed the same agent ID
    expect(agentStatus).toBe(200);
    expect(agentData).toHaveProperty('id', 'test-agent-id');
    expect(connectionsStatus).toBe(200);
  });
}); 