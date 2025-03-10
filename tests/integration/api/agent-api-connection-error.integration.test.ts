import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as agentDb from '../../../lib/agent-db';
import { POST as connectAgentToApi } from '../../../app/api/agents/[agentId]/api-connections/[apiConnectionId]/route';

// Mock the next-auth getServerSession function
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock the agent-db functions
vi.mock('../../../lib/agent-db', () => ({
  getAgentById: vi.fn(),
  getApiConnectionById: vi.fn(),
  connectAgentToApi: vi.fn(),
}));

// Mock data
const mockUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
};

const mockApiConnection = {
  id: 'api-conn-123',
  name: 'Test API Connection',
  service: 'openai',
  apiKey: 'encrypted-api-key',
  userId: 'user-123',
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Agent API Connection Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return 404 with "Agent not found" message when agent does not exist', async () => {
    // Mock the session
    vi.mocked(getServerSession).mockResolvedValue({
      user: mockUser,
      expires: new Date().toISOString(),
    });

    // Mock the agent retrieval (not found)
    vi.mocked(agentDb.getAgentById).mockResolvedValue(null);

    // Mock the API connection retrieval
    vi.mocked(agentDb.getApiConnectionById).mockResolvedValue(mockApiConnection);

    // Create a mock request
    const req = new NextRequest('http://localhost:3000/api/agents/non-existent-agent/api-connections/api-conn-123', {
      method: 'POST',
    });

    // Call the API route
    const response = await connectAgentToApi(req, {
      params: {
        agentId: 'non-existent-agent',
        apiConnectionId: 'api-conn-123',
      },
    });

    // Check the response
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: 'Agent not found' });

    // Check that the functions were called with the correct parameters
    expect(agentDb.getAgentById).toHaveBeenCalledWith('non-existent-agent', 'user-123');
    expect(agentDb.getApiConnectionById).not.toHaveBeenCalled();
    expect(agentDb.connectAgentToApi).not.toHaveBeenCalled();
  });

  it('should return 400 with error message when connection fails', async () => {
    // Mock the session
    vi.mocked(getServerSession).mockResolvedValue({
      user: mockUser,
      expires: new Date().toISOString(),
    });

    // Mock the agent retrieval (found)
    vi.mocked(agentDb.getAgentById).mockResolvedValue({
      id: 'agent-123',
      name: 'Test Agent',
      description: 'A test agent',
      systemPrompt: 'You are a test agent',
      model: 'gpt-3.5-turbo',
      temperature: '0.7',
      maxTokens: 1000,
      userId: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Mock the API connection retrieval
    vi.mocked(agentDb.getApiConnectionById).mockResolvedValue(mockApiConnection);

    // Mock the connection to fail
    vi.mocked(agentDb.connectAgentToApi).mockResolvedValue(false);

    // Create a mock request
    const req = new NextRequest('http://localhost:3000/api/agents/agent-123/api-connections/api-conn-123', {
      method: 'POST',
    });

    // Call the API route
    const response = await connectAgentToApi(req, {
      params: {
        agentId: 'agent-123',
        apiConnectionId: 'api-conn-123',
      },
    });

    // Check the response
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ 
      error: 'Failed to connect API connection to agent. The connection may already exist.' 
    });

    // Check that the functions were called with the correct parameters
    expect(agentDb.getAgentById).toHaveBeenCalledWith('agent-123', 'user-123');
    expect(agentDb.getApiConnectionById).toHaveBeenCalledWith('api-conn-123', 'user-123');
    expect(agentDb.connectAgentToApi).toHaveBeenCalledWith('agent-123', 'api-conn-123', 'user-123');
  });
}); 