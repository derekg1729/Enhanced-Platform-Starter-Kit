import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import * as agentDb from '../../../lib/agent-db';
import { GET, POST } from '../../../app/api/agents/route';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock agent-db
vi.mock('../../../lib/agent-db', () => ({
  getAgentsByUserId: vi.fn(),
  createAgent: vi.fn(),
}));

describe('Agents API Routes', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    },
    expires: '2023-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/agents', () => {
    it('returns 401 if user is not authenticated', async () => {
      // Mock session to return null (unauthenticated)
      vi.mocked(getServerSession).mockResolvedValueOnce(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents');

      // Call the API route
      const response = await GET(req);

      // Check the response
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('returns agents for authenticated user', async () => {
      // Mock session to return a valid session
      vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

      // Create dates for consistent testing
      const createdAt = new Date();
      const updatedAt = new Date();

      // Mock the database response
      const mockAgents = [
        {
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
        },
      ];
      vi.mocked(agentDb.getAgentsByUserId).mockResolvedValueOnce(mockAgents);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents');

      // Call the API route
      const response = await GET(req);

      // Check the response
      expect(response.status).toBe(200);
      const data = await response.json();
      
      // Convert dates to strings for comparison
      const expectedAgents = [
        {
          ...mockAgents[0],
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        },
      ];
      
      expect(data).toEqual(expectedAgents);

      // Check that the function was called with the correct parameters
      expect(agentDb.getAgentsByUserId).toHaveBeenCalledWith('user-123');
    });
  });

  describe('POST /api/agents', () => {
    it('returns 401 if user is not authenticated', async () => {
      // Mock session to return null (unauthenticated)
      vi.mocked(getServerSession).mockResolvedValueOnce(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Agent',
          systemPrompt: 'You are a new agent',
        }),
      });

      // Call the API route
      const response = await POST(req);

      // Check the response
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('returns 400 if required fields are missing', async () => {
      // Mock session to return a valid session
      vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

      // Create a mock request with missing fields
      const req = new NextRequest('http://localhost:3000/api/agents', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Agent',
          // Missing systemPrompt
        }),
      });

      // Call the API route
      const response = await POST(req);

      // Check the response
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ error: 'Missing required fields' });
    });

    it('creates a new agent for authenticated user', async () => {
      // Mock session to return a valid session
      vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

      // Create dates for consistent testing
      const createdAt = new Date();
      const updatedAt = new Date();

      // Mock the database response
      const mockAgent = {
        id: 'agent-123',
        userId: 'user-123',
        name: 'New Agent',
        description: 'A new agent',
        systemPrompt: 'You are a new agent',
        model: 'gpt-4',
        temperature: '0.7',
        maxTokens: 1000,
        createdAt,
        updatedAt,
      };
      vi.mocked(agentDb.createAgent).mockResolvedValueOnce(mockAgent);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Agent',
          description: 'A new agent',
          systemPrompt: 'You are a new agent',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 1000,
          apiConnectionId: 'test-api-connection-123',
        }),
      });

      // Call the API route
      const response = await POST(req);

      // Check the response
      expect(response.status).toBe(201);
      const data = await response.json();
      
      // Convert dates to strings for comparison
      const expectedAgent = {
        ...mockAgent,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      };
      
      expect(data).toEqual(expectedAgent);

      // Check that the function was called with the correct parameters
      expect(agentDb.createAgent).toHaveBeenCalledWith('user-123', {
        name: 'New Agent',
        description: 'A new agent',
        systemPrompt: 'You are a new agent',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        apiConnectionId: 'test-api-connection-123',
      });
    });
  });
}); 