import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import * as agentDb from '../../../lib/agent-db';
import { GET, PUT, DELETE } from '../../../app/api/agents/[id]/route';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock agent-db
vi.mock('../../../lib/agent-db', () => ({
  getAgentById: vi.fn(),
  updateAgent: vi.fn(),
  deleteAgent: vi.fn(),
}));

describe('Agent by ID API Routes', () => {
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

  describe('GET /api/agents/:id', () => {
    it('returns 401 if user is not authenticated', async () => {
      // Mock session to return null (unauthenticated)
      vi.mocked(getServerSession).mockResolvedValueOnce(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents/agent-123');

      // Call the API route
      const response = await GET(req, { params: { id: 'agent-123' } });

      // Check the response
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('returns 404 if agent is not found', async () => {
      // Mock session to return a valid session
      vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

      // Mock the database response
      vi.mocked(agentDb.getAgentById).mockResolvedValueOnce(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents/non-existent-id');

      // Call the API route
      const response = await GET(req, { params: { id: 'non-existent-id' } });

      // Check the response
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({ error: 'Agent not found' });

      // Check that the function was called with the correct parameters
      expect(agentDb.getAgentById).toHaveBeenCalledWith('non-existent-id', 'user-123');
    });

    it('returns agent for authenticated user', async () => {
      // Mock session to return a valid session
      vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

      // Mock the database response
      vi.mocked(agentDb.getAgentById).mockResolvedValueOnce(mockAgent);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents/agent-123');

      // Call the API route
      const response = await GET(req, { params: { id: 'agent-123' } });

      // Check the response
      expect(response.status).toBe(200);
      const data = await response.json();
      
      // Convert dates to strings for comparison
      const expectedAgent = {
        ...mockAgent,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      };
      
      expect(data).toEqual(expectedAgent);

      // Check that the function was called with the correct parameters
      expect(agentDb.getAgentById).toHaveBeenCalledWith('agent-123', 'user-123');
    });
  });

  describe('PUT /api/agents/:id', () => {
    it('returns 401 if user is not authenticated', async () => {
      // Mock session to return null (unauthenticated)
      vi.mocked(getServerSession).mockResolvedValueOnce(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents/agent-123', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Agent',
          systemPrompt: 'You are an updated agent',
        }),
      });

      // Call the API route
      const response = await PUT(req, { params: { id: 'agent-123' } });

      // Check the response
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('returns 404 if agent is not found', async () => {
      // Mock session to return a valid session
      vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

      // Mock the database response
      vi.mocked(agentDb.updateAgent).mockResolvedValueOnce(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents/non-existent-id', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Agent',
          systemPrompt: 'You are an updated agent',
        }),
      });

      // Call the API route
      const response = await PUT(req, { params: { id: 'non-existent-id' } });

      // Check the response
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({ error: 'Agent not found' });

      // Check that the function was called with the correct parameters
      expect(agentDb.updateAgent).toHaveBeenCalledWith('non-existent-id', 'user-123', {
        name: 'Updated Agent',
        systemPrompt: 'You are an updated agent',
      });
    });

    it('updates agent for authenticated user', async () => {
      // Mock session to return a valid session
      vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

      // Create a new date for the update
      const newUpdatedAt = new Date();

      // Mock the database response
      const updatedAgent = {
        ...mockAgent,
        name: 'Updated Agent',
        systemPrompt: 'You are an updated agent',
        updatedAt: newUpdatedAt,
      };
      vi.mocked(agentDb.updateAgent).mockResolvedValueOnce(updatedAgent);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents/agent-123', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Agent',
          systemPrompt: 'You are an updated agent',
        }),
      });

      // Call the API route
      const response = await PUT(req, { params: { id: 'agent-123' } });

      // Check the response
      expect(response.status).toBe(200);
      const data = await response.json();
      
      // Convert dates to strings for comparison
      const expectedAgent = {
        ...updatedAgent,
        createdAt: createdAt.toISOString(),
        updatedAt: newUpdatedAt.toISOString(),
      };
      
      expect(data).toEqual(expectedAgent);

      // Check that the function was called with the correct parameters
      expect(agentDb.updateAgent).toHaveBeenCalledWith('agent-123', 'user-123', {
        name: 'Updated Agent',
        systemPrompt: 'You are an updated agent',
      });
    });
  });

  describe('DELETE /api/agents/:id', () => {
    it('returns 401 if user is not authenticated', async () => {
      // Mock session to return null (unauthenticated)
      vi.mocked(getServerSession).mockResolvedValueOnce(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents/agent-123', {
        method: 'DELETE',
      });

      // Call the API route
      const response = await DELETE(req, { params: { id: 'agent-123' } });

      // Check the response
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('returns 404 if agent is not found', async () => {
      // Mock session to return a valid session
      vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

      // Mock the database response
      vi.mocked(agentDb.deleteAgent).mockResolvedValueOnce(false);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents/non-existent-id', {
        method: 'DELETE',
      });

      // Call the API route
      const response = await DELETE(req, { params: { id: 'non-existent-id' } });

      // Check the response
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({ error: 'Agent not found' });

      // Check that the function was called with the correct parameters
      expect(agentDb.deleteAgent).toHaveBeenCalledWith('non-existent-id', 'user-123');
    });

    it('deletes agent for authenticated user', async () => {
      // Mock session to return a valid session
      vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

      // Mock the database response
      vi.mocked(agentDb.deleteAgent).mockResolvedValueOnce(true);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents/agent-123', {
        method: 'DELETE',
      });

      // Call the API route
      const response = await DELETE(req, { params: { id: 'agent-123' } });

      // Check the response
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ success: true });

      // Check that the function was called with the correct parameters
      expect(agentDb.deleteAgent).toHaveBeenCalledWith('agent-123', 'user-123');
    });
  });
}); 