import { describe, test, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getAgent } from '../../../../app/api/agents/[agentId]/route';
import { GET as getAgentApiConnections } from '../../../../app/api/agents/[agentId]/api-connections/route';

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
      new NextRequest('http://localhost/api/agents/test-agent-id'),
      { params: { agentId: 'test-agent-id' } }
    );
    const agentData = await agentResponse.json();
    
    // Test the agent API connections endpoint
    const connectionsResponse = await getAgentApiConnections(
      new NextRequest('http://localhost/api/agents/test-agent-id/api-connections'),
      { params: { agentId: 'test-agent-id' } }
    );
    const connectionsData = await connectionsResponse.json();

    // Verify both endpoints successfully processed the same agent ID
    expect(agentData).toHaveProperty('id', 'test-agent-id');
    expect(connectionsResponse.status).toBe(200);
  });
}); 