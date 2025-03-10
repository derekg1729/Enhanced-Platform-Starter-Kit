import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { getServerSession } from 'next-auth';
import { encryptApiKey } from '../../../lib/api-key-utils';
import * as agentDb from '../../../lib/agent-db';
import { GET as getApiConnections, POST as createApiConnection } from '../../../app/api/api-connections/route';
import { GET as getApiConnectionById, PUT as updateApiConnection, DELETE as deleteApiConnection } from '../../../app/api/api-connections/[id]/route';
import { GET as getAgentApiConnections } from '../../../app/api/agents/[id]/api-connections/route';

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
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: { model: 'gpt-4' },
};

describe('API Connections API Routes', () => {
  beforeEach(() => {
    // Mock the session to return a logged-in user
    vi.mocked(getServerSession).mockResolvedValue({
      user: mockUser,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/api-connections', () => {
    it('should create a new API connection', async () => {
      // Mock the createApiConnection function to return a mock API connection
      vi.mocked(agentDb.createApiConnection).mockResolvedValue(mockApiConnection);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Test API Connection',
          service: 'openai',
          apiKey: 'test-api-key',
          metadata: { model: 'gpt-4' },
        },
      });

      // Call the handler
      await createApiConnection(req, res);

      // Verify the response
      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual({
        ...mockApiConnection,
        apiKey: undefined, // API key should not be returned in the response
      });

      // Verify that createApiConnection was called with the correct arguments
      expect(agentDb.createApiConnection).toHaveBeenCalledWith({
        name: 'Test API Connection',
        service: 'openai',
        apiKey: 'test-api-key',
        userId: 'user-123',
        metadata: { model: 'gpt-4' },
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mock the session to return null (user not logged in)
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Test API Connection',
          service: 'openai',
          apiKey: 'test-api-key',
        },
      });

      // Call the handler
      await createApiConnection(req, res);

      // Verify the response
      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Unauthorized',
      });

      // Verify that createApiConnection was not called
      expect(agentDb.createApiConnection).not.toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      // Create mock request and response with missing fields
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          // Missing name and service
          apiKey: 'test-api-key',
        },
      });

      // Call the handler
      await createApiConnection(req, res);

      // Verify the response
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Missing required fields',
      });

      // Verify that createApiConnection was not called
      expect(agentDb.createApiConnection).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/api-connections', () => {
    it('should return all API connections for the user', async () => {
      // Mock the getApiConnectionsByUserId function to return an array of API connections
      vi.mocked(agentDb.getApiConnectionsByUserId).mockResolvedValue([mockApiConnection]);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'GET',
      });

      // Call the handler
      await getApiConnections(req, res);

      // Verify the response
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual([
        {
          ...mockApiConnection,
          apiKey: undefined, // API key should not be returned in the response
        },
      ]);

      // Verify that getApiConnectionsByUserId was called with the correct arguments
      expect(agentDb.getApiConnectionsByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mock the session to return null (user not logged in)
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'GET',
      });

      // Call the handler
      await getApiConnections(req, res);

      // Verify the response
      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Unauthorized',
      });

      // Verify that getApiConnectionsByUserId was not called
      expect(agentDb.getApiConnectionsByUserId).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/api-connections/:id', () => {
    it('should return a specific API connection', async () => {
      // Mock the getApiConnectionById function to return a mock API connection
      vi.mocked(agentDb.getApiConnectionById).mockResolvedValue(mockApiConnection);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'GET',
      });

      // Call the handler with params
      await getApiConnectionById(req, res, { params: { id: 'api-conn-123' } });

      // Verify the response
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        ...mockApiConnection,
        apiKey: undefined, // API key should not be returned in the response
      });

      // Verify that getApiConnectionById was called with the correct arguments
      expect(agentDb.getApiConnectionById).toHaveBeenCalledWith('api-conn-123', 'user-123');
    });

    it('should return 404 if API connection is not found', async () => {
      // Mock the getApiConnectionById function to return null
      vi.mocked(agentDb.getApiConnectionById).mockResolvedValue(null);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'GET',
      });

      // Call the handler with params
      await getApiConnectionById(req, res, { params: { id: 'non-existent-id' } });

      // Verify the response
      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'API connection not found',
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mock the session to return null (user not logged in)
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'GET',
      });

      // Call the handler with params
      await getApiConnectionById(req, res, { params: { id: 'api-conn-123' } });

      // Verify the response
      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Unauthorized',
      });

      // Verify that getApiConnectionById was not called
      expect(agentDb.getApiConnectionById).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/api-connections/:id', () => {
    it('should update an existing API connection', async () => {
      // Mock the getApiConnectionById function to return a mock API connection
      vi.mocked(agentDb.getApiConnectionById).mockResolvedValue(mockApiConnection);
      
      // Mock the updateApiConnection function to return the updated API connection
      const updatedConnection = {
        ...mockApiConnection,
        name: 'Updated API Connection',
        metadata: { model: 'gpt-4-turbo' },
      };
      vi.mocked(agentDb.updateApiConnection).mockResolvedValue(updatedConnection);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          name: 'Updated API Connection',
          metadata: { model: 'gpt-4-turbo' },
        },
      });

      // Call the handler with params
      await updateApiConnection(req, res, { params: { id: 'api-conn-123' } });

      // Verify the response
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        ...updatedConnection,
        apiKey: undefined, // API key should not be returned in the response
      });

      // Verify that updateApiConnection was called with the correct arguments
      expect(agentDb.updateApiConnection).toHaveBeenCalledWith('api-conn-123', 'user-123', {
        name: 'Updated API Connection',
        metadata: { model: 'gpt-4-turbo' },
      });
    });

    it('should return 404 if API connection is not found', async () => {
      // Mock the getApiConnectionById function to return null
      vi.mocked(agentDb.getApiConnectionById).mockResolvedValue(null);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          name: 'Updated API Connection',
        },
      });

      // Call the handler with params
      await updateApiConnection(req, res, { params: { id: 'non-existent-id' } });

      // Verify the response
      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'API connection not found',
      });

      // Verify that updateApiConnection was not called
      expect(agentDb.updateApiConnection).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mock the session to return null (user not logged in)
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          name: 'Updated API Connection',
        },
      });

      // Call the handler with params
      await updateApiConnection(req, res, { params: { id: 'api-conn-123' } });

      // Verify the response
      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Unauthorized',
      });

      // Verify that updateApiConnection was not called
      expect(agentDb.updateApiConnection).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/api-connections/:id', () => {
    it('should delete an API connection', async () => {
      // Mock the deleteApiConnection function to return true
      vi.mocked(agentDb.deleteApiConnection).mockResolvedValue(true);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'DELETE',
      });

      // Call the handler with params
      await deleteApiConnection(req, res, { params: { id: 'api-conn-123' } });

      // Verify the response
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
      });

      // Verify that deleteApiConnection was called with the correct arguments
      expect(agentDb.deleteApiConnection).toHaveBeenCalledWith('api-conn-123', 'user-123');
    });

    it('should return 404 if API connection is not found or deletion fails', async () => {
      // Mock the deleteApiConnection function to return false
      vi.mocked(agentDb.deleteApiConnection).mockResolvedValue(false);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'DELETE',
      });

      // Call the handler with params
      await deleteApiConnection(req, res, { params: { id: 'non-existent-id' } });

      // Verify the response
      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'API connection not found or deletion failed',
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mock the session to return null (user not logged in)
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'DELETE',
      });

      // Call the handler with params
      await deleteApiConnection(req, res, { params: { id: 'api-conn-123' } });

      // Verify the response
      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Unauthorized',
      });

      // Verify that deleteApiConnection was not called
      expect(agentDb.deleteApiConnection).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/agents/:id/api-connections', () => {
    it('should return all API connections for a specific agent', async () => {
      // Mock the getApiConnectionsForAgent function to return an array of API connections
      vi.mocked(agentDb.getApiConnectionsForAgent).mockResolvedValue([mockApiConnection]);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'GET',
      });

      // Call the handler with params
      await getAgentApiConnections(req, res, { params: { id: 'agent-123' } });

      // Verify the response
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual([
        {
          ...mockApiConnection,
          apiKey: undefined, // API key should not be returned in the response
        },
      ]);

      // Verify that getApiConnectionsForAgent was called with the correct arguments
      expect(agentDb.getApiConnectionsForAgent).toHaveBeenCalledWith('agent-123', 'user-123');
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mock the session to return null (user not logged in)
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'GET',
      });

      // Call the handler with params
      await getAgentApiConnections(req, res, { params: { id: 'agent-123' } });

      // Verify the response
      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Unauthorized',
      });

      // Verify that getApiConnectionsForAgent was not called
      expect(agentDb.getApiConnectionsForAgent).not.toHaveBeenCalled();
    });
  });
}); 