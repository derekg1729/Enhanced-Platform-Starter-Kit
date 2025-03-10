import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as agentDb from '../../../lib/agent-db';
import { POST as createApiConnection, GET as getApiConnections } from '../../../app/api/api-connections/route';
import { GET as getApiConnectionById, PUT as updateApiConnection, DELETE as deleteApiConnection } from '../../../app/api/api-connections/[id]/route';
import { GET as getApiServices } from '../../../app/api/api-connections/services/route';
import { GET as getAgentApiConnections } from '../../../app/api/agents/[agentId]/api-connections/route';
import { encryptApiKey } from '../../../lib/api-key-utils';

// Mock the next-auth getServerSession function
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock the agent-db functions
vi.mock('../../../lib/agent-db', () => ({
  createApiConnection: vi.fn(),
  getApiConnectionsByUserId: vi.fn(),
  getApiConnectionById: vi.fn(),
  updateApiConnection: vi.fn(),
  deleteApiConnection: vi.fn(),
  getApiConnectionsForAgent: vi.fn(),
  getAgentById: vi.fn(),
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
  apiKey: encryptApiKey('test-api-key'),
  userId: 'user-123',
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAgent = {
  id: 'agent-123',
  name: 'Test Agent',
  description: 'A test agent',
  systemPrompt: 'You are a test agent',
  model: 'gpt-3.5-turbo',
  temperature: '0.7', // String to match the type in the database
  maxTokens: 1000,
  userId: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('API Connections API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/api-connections', () => {
    it('should create a new API connection', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the createApiConnection function
      vi.mocked(agentDb.createApiConnection).mockResolvedValue(mockApiConnection);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/api-connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test API Connection',
          service: 'openai',
          apiKey: 'test-api-key',
        }),
      });

      // Call the API route
      const response = await createApiConnection(req);

      // Check the response
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).not.toHaveProperty('apiKey');
      expect(data).toHaveProperty('id', 'api-conn-123');
      expect(data).toHaveProperty('name', 'Test API Connection');

      // Check that the function was called with the correct parameters
      expect(agentDb.createApiConnection).toHaveBeenCalledWith(
        'user-123',
        {
          name: 'Test API Connection',
          service: 'openai',
          apiKey: 'test-api-key',
          metadata: {},
        }
      );
    });

    it('should return 401 if the user is not authenticated', async () => {
      // Mock the session (no user)
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/api-connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test API Connection',
          service: 'openai',
          apiKey: 'test-api-key',
        }),
      });

      // Call the API route
      const response = await createApiConnection(req);

      // Check the response
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: 'Unauthorized' });

      // Check that the function was not called
      expect(agentDb.createApiConnection).not.toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Create a mock request with missing fields
      const req = new NextRequest('http://localhost:3000/api/api-connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test API Connection',
          // Missing service and apiKey
        }),
      });

      // Call the API route
      const response = await createApiConnection(req);

      // Check the response
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ error: 'Validation failed: service: Required, apiKey: Required' });

      // Check that the function was not called
      expect(agentDb.createApiConnection).not.toHaveBeenCalled();
    });

    it('should handle malformed JSON in request body', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Create a mock request with malformed JSON
      const req = new NextRequest('http://localhost:3000/api/api-connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{ invalid json',
      });

      // Call the API route
      const response = await createApiConnection(req);

      // Check the response
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ error: 'Invalid request body - failed to parse JSON' });
    });

    it('should handle database errors gracefully', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the createApiConnection function to throw an error
      vi.mocked(agentDb.createApiConnection).mockRejectedValue(new Error('Database error'));

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/api-connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test API Connection',
          service: 'openai',
          apiKey: 'test-api-key',
        }),
      });

      // Call the API route
      const response = await createApiConnection(req);

      // Check the response
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to create API connection' });
    });

    it('should validate API key format', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Create a mock request with invalid API key format
      const req = new NextRequest('http://localhost:3000/api/api-connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test API Connection',
          service: 'openai',
          apiKey: '', // Empty API key
        }),
      });

      // Call the API route
      const response = await createApiConnection(req);

      // Check the response
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Validation failed');
      expect(data.error).toContain('API Key is required');
    });
  });

  describe('GET /api/api-connections', () => {
    it('should return all API connections for the user', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the getApiConnectionsByUserId function
      vi.mocked(agentDb.getApiConnectionsByUserId).mockResolvedValue([mockApiConnection]);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/api-connections', {
        method: 'GET',
      });

      // Call the API route
      const response = await getApiConnections(req);

      // Check the response
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveLength(1);
      expect(data[0]).not.toHaveProperty('apiKey');
      expect(data[0]).toHaveProperty('id', 'api-conn-123');

      // Check that the function was called with the correct parameters
      expect(agentDb.getApiConnectionsByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should return 401 if the user is not authenticated', async () => {
      // Mock the session (no user)
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/api-connections', {
        method: 'GET',
      });

      // Call the API route
      const response = await getApiConnections(req);

      // Check the response
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: 'Unauthorized' });

      // Check that the function was not called
      expect(agentDb.getApiConnectionsByUserId).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/api-connections/:id', () => {
    it('should return a specific API connection', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the getApiConnectionById function
      vi.mocked(agentDb.getApiConnectionById).mockResolvedValue(mockApiConnection);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/api-connections/api-conn-123', {
        method: 'GET',
      });

      // Call the API route
      const response = await getApiConnectionById(req, { params: { id: 'api-conn-123' } });

      // Check the response
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).not.toHaveProperty('apiKey');
      expect(data).toHaveProperty('id', 'api-conn-123');

      // Check that the function was called with the correct parameters
      expect(agentDb.getApiConnectionById).toHaveBeenCalledWith('api-conn-123', 'user-123');
    });

    it('should return 404 if the API connection is not found', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the getApiConnectionById function (not found)
      vi.mocked(agentDb.getApiConnectionById).mockResolvedValue(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/api-connections/non-existent-id', {
        method: 'GET',
      });

      // Call the API route
      const response = await getApiConnectionById(req, { params: { id: 'non-existent-id' } });

      // Check the response
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({ error: 'API connection not found' });

      // Check that the function was called with the correct parameters
      expect(agentDb.getApiConnectionById).toHaveBeenCalledWith('non-existent-id', 'user-123');
    });

    it('should return 401 if the user is not authenticated', async () => {
      // Mock the session (no user)
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/api-connections/api-conn-123', {
        method: 'GET',
      });

      // Call the API route
      const response = await getApiConnectionById(req, { params: { id: 'api-conn-123' } });

      // Check the response
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: 'Unauthorized' });

      // Check that the function was not called
      expect(agentDb.getApiConnectionById).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/api-connections/:id', () => {
    it('should update an API connection', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the updateApiConnection function
      vi.mocked(agentDb.updateApiConnection).mockResolvedValue({
        ...mockApiConnection,
        name: 'Updated API Connection',
      });

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/api-connections/api-conn-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Updated API Connection',
        }),
      });

      // Call the API route
      const response = await updateApiConnection(req, { params: { id: 'api-conn-123' } });

      // Check the response
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).not.toHaveProperty('apiKey');
      expect(data).toHaveProperty('name', 'Updated API Connection');

      // Check that the function was called with the correct parameters
      expect(agentDb.updateApiConnection).toHaveBeenCalledWith(
        'api-conn-123',
        'user-123',
        {
          name: 'Updated API Connection',
          service: undefined,
          apiKey: undefined,
          metadata: undefined,
        }
      );
    });

    it('should return 404 if the API connection is not found', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the updateApiConnection function (not found)
      vi.mocked(agentDb.updateApiConnection).mockResolvedValue(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/api-connections/non-existent-id', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Updated API Connection',
        }),
      });

      // Call the API route
      const response = await updateApiConnection(req, { params: { id: 'non-existent-id' } });

      // Check the response
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({ error: 'API connection not found' });

      // Check that the function was called with the correct parameters
      expect(agentDb.updateApiConnection).toHaveBeenCalledWith(
        'non-existent-id',
        'user-123',
        {
          name: 'Updated API Connection',
          service: undefined,
          apiKey: undefined,
          metadata: undefined,
        }
      );
    });

    it('should return 401 if the user is not authenticated', async () => {
      // Mock the session (no user)
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/api-connections/api-conn-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Updated API Connection',
        }),
      });

      // Call the API route
      const response = await updateApiConnection(req, { params: { id: 'api-conn-123' } });

      // Check the response
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: 'Unauthorized' });

      // Check that the function was not called
      expect(agentDb.updateApiConnection).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/api-connections/:id', () => {
    it('should delete an API connection', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the deleteApiConnection function
      vi.mocked(agentDb.deleteApiConnection).mockResolvedValue(true);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/api-connections/api-conn-123', {
        method: 'DELETE',
      });

      // Call the API route
      const response = await deleteApiConnection(req, { params: { id: 'api-conn-123' } });

      // Check the response
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ success: true });

      // Check that the function was called with the correct parameters
      expect(agentDb.deleteApiConnection).toHaveBeenCalledWith('api-conn-123', 'user-123');
    });

    it('should return 404 if the API connection is not found', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the deleteApiConnection function (not found)
      vi.mocked(agentDb.deleteApiConnection).mockResolvedValue(false);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/api-connections/non-existent-id', {
        method: 'DELETE',
      });

      // Call the API route
      const response = await deleteApiConnection(req, { params: { id: 'non-existent-id' } });

      // Check the response
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({ error: 'API connection not found' });

      // Check that the function was called with the correct parameters
      expect(agentDb.deleteApiConnection).toHaveBeenCalledWith('non-existent-id', 'user-123');
    });

    it('should return 401 if the user is not authenticated', async () => {
      // Mock the session (no user)
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/api-connections/api-conn-123', {
        method: 'DELETE',
      });

      // Call the API route
      const response = await deleteApiConnection(req, { params: { id: 'api-conn-123' } });

      // Check the response
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: 'Unauthorized' });

      // Check that the function was not called
      expect(agentDb.deleteApiConnection).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/agents/:id/api-connections', () => {
    it('should return all API connections for an agent', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the getAgentById function
      vi.mocked(agentDb.getAgentById).mockResolvedValue(mockAgent);

      // Mock the getApiConnectionsForAgent function
      vi.mocked(agentDb.getApiConnectionsForAgent).mockResolvedValue([mockApiConnection]);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents/agent-123/api-connections', {
        method: 'GET',
      });

      // Call the API route
      const response = await getAgentApiConnections(req, { params: { agentId: 'agent-123' } });

      // Check the response
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveLength(1);
      expect(data[0]).not.toHaveProperty('apiKey');
      expect(data[0]).toHaveProperty('id', 'api-conn-123');

      // Check that the functions were called with the correct parameters
      expect(agentDb.getAgentById).toHaveBeenCalledWith('agent-123', 'user-123');
      expect(agentDb.getApiConnectionsForAgent).toHaveBeenCalledWith('agent-123', 'user-123');
    });

    it('should return 404 if the agent is not found', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the getAgentById function (not found)
      vi.mocked(agentDb.getAgentById).mockResolvedValue(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents/non-existent-id/api-connections', {
        method: 'GET',
      });

      // Call the API route
      const response = await getAgentApiConnections(req, { params: { agentId: 'non-existent-id' } });

      // Check the response
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({ error: 'Agent not found' });

      // Check that the functions were called with the correct parameters
      expect(agentDb.getAgentById).toHaveBeenCalledWith('non-existent-id', 'user-123');
      expect(agentDb.getApiConnectionsForAgent).not.toHaveBeenCalled();
    });
  });
}); 