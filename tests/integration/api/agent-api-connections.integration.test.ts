import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { getServerSession } from 'next-auth';
import { encryptApiKey } from '../../../lib/api-key-utils';
import * as agentDb from '../../../lib/agent-db';
import { POST as connectAgentToApi, DELETE as disconnectAgentFromApi } from '../../../app/api/agents/[agentId]/api-connections/[apiConnectionId]/route';

// Mock the next-auth getServerSession function
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock the agent-db functions
vi.mock('../../../lib/agent-db', () => ({
  connectAgentToApi: vi.fn(),
  disconnectAgentFromApi: vi.fn(),
  getAgentById: vi.fn(),
  getApiConnectionById: vi.fn(),
}));

// Mock data
const mockUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
};

const mockAgent = {
  id: 'agent-123',
  name: 'Test Agent',
  description: 'A test agent',
  systemPrompt: 'You are a test agent',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000,
  userId: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
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

const mockAgentApiConnection = {
  id: 'agent-api-conn-123',
  agentId: 'agent-123',
  apiConnectionId: 'api-conn-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Agent API Connections API Routes', () => {
  beforeEach(() => {
    // Mock the session to return a logged-in user
    vi.mocked(getServerSession).mockResolvedValue({
      user: mockUser,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    // Mock the getAgentById function to return a mock agent
    vi.mocked(agentDb.getAgentById).mockResolvedValue(mockAgent);

    // Mock the getApiConnectionById function to return a mock API connection
    vi.mocked(agentDb.getApiConnectionById).mockResolvedValue(mockApiConnection);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/agents/:agentId/api-connections/:apiConnectionId', () => {
    it('should connect an agent to an API connection', async () => {
      // Mock the connectAgentToApi function to return a mock agent-API connection
      vi.mocked(agentDb.connectAgentToApi).mockResolvedValue(mockAgentApiConnection);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'POST',
      });

      // Call the handler with params
      await connectAgentToApi(req, res, { 
        params: { 
          agentId: 'agent-123', 
          apiConnectionId: 'api-conn-123' 
        } 
      });

      // Verify the response
      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(mockAgentApiConnection);

      // Verify that connectAgentToApi was called with the correct arguments
      expect(agentDb.connectAgentToApi).toHaveBeenCalledWith('agent-123', 'api-conn-123', 'user-123');
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mock the session to return null (user not logged in)
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'POST',
      });

      // Call the handler with params
      await connectAgentToApi(req, res, { 
        params: { 
          agentId: 'agent-123', 
          apiConnectionId: 'api-conn-123' 
        } 
      });

      // Verify the response
      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Unauthorized',
      });

      // Verify that connectAgentToApi was not called
      expect(agentDb.connectAgentToApi).not.toHaveBeenCalled();
    });

    it('should return 404 if agent is not found', async () => {
      // Mock the getAgentById function to return null
      vi.mocked(agentDb.getAgentById).mockResolvedValue(null);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'POST',
      });

      // Call the handler with params
      await connectAgentToApi(req, res, { 
        params: { 
          agentId: 'non-existent-agent', 
          apiConnectionId: 'api-conn-123' 
        } 
      });

      // Verify the response
      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Agent not found',
      });

      // Verify that connectAgentToApi was not called
      expect(agentDb.connectAgentToApi).not.toHaveBeenCalled();
    });

    it('should return 404 if API connection is not found', async () => {
      // Mock the getApiConnectionById function to return null
      vi.mocked(agentDb.getApiConnectionById).mockResolvedValue(null);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'POST',
      });

      // Call the handler with params
      await connectAgentToApi(req, res, { 
        params: { 
          agentId: 'agent-123', 
          apiConnectionId: 'non-existent-api-conn' 
        } 
      });

      // Verify the response
      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'API connection not found',
      });

      // Verify that connectAgentToApi was not called
      expect(agentDb.connectAgentToApi).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not own the agent', async () => {
      // Mock the getAgentById function to return an agent with a different userId
      vi.mocked(agentDb.getAgentById).mockResolvedValue({
        ...mockAgent,
        userId: 'different-user-id',
      });

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'POST',
      });

      // Call the handler with params
      await connectAgentToApi(req, res, { 
        params: { 
          agentId: 'agent-123', 
          apiConnectionId: 'api-conn-123' 
        } 
      });

      // Verify the response
      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Forbidden',
      });

      // Verify that connectAgentToApi was not called
      expect(agentDb.connectAgentToApi).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not own the API connection', async () => {
      // Mock the getApiConnectionById function to return an API connection with a different userId
      vi.mocked(agentDb.getApiConnectionById).mockResolvedValue({
        ...mockApiConnection,
        userId: 'different-user-id',
      });

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'POST',
      });

      // Call the handler with params
      await connectAgentToApi(req, res, { 
        params: { 
          agentId: 'agent-123', 
          apiConnectionId: 'api-conn-123' 
        } 
      });

      // Verify the response
      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Forbidden',
      });

      // Verify that connectAgentToApi was not called
      expect(agentDb.connectAgentToApi).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/agents/:agentId/api-connections/:apiConnectionId', () => {
    it('should disconnect an agent from an API connection', async () => {
      // Mock the disconnectAgentFromApi function to return true
      vi.mocked(agentDb.disconnectAgentFromApi).mockResolvedValue(true);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'DELETE',
      });

      // Call the handler with params
      await disconnectAgentFromApi(req, res, { 
        params: { 
          agentId: 'agent-123', 
          apiConnectionId: 'api-conn-123' 
        } 
      });

      // Verify the response
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
      });

      // Verify that disconnectAgentFromApi was called with the correct arguments
      expect(agentDb.disconnectAgentFromApi).toHaveBeenCalledWith('agent-123', 'api-conn-123', 'user-123');
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mock the session to return null (user not logged in)
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'DELETE',
      });

      // Call the handler with params
      await disconnectAgentFromApi(req, res, { 
        params: { 
          agentId: 'agent-123', 
          apiConnectionId: 'api-conn-123' 
        } 
      });

      // Verify the response
      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Unauthorized',
      });

      // Verify that disconnectAgentFromApi was not called
      expect(agentDb.disconnectAgentFromApi).not.toHaveBeenCalled();
    });

    it('should return 404 if agent is not found', async () => {
      // Mock the getAgentById function to return null
      vi.mocked(agentDb.getAgentById).mockResolvedValue(null);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'DELETE',
      });

      // Call the handler with params
      await disconnectAgentFromApi(req, res, { 
        params: { 
          agentId: 'non-existent-agent', 
          apiConnectionId: 'api-conn-123' 
        } 
      });

      // Verify the response
      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Agent not found',
      });

      // Verify that disconnectAgentFromApi was not called
      expect(agentDb.disconnectAgentFromApi).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not own the agent', async () => {
      // Mock the getAgentById function to return an agent with a different userId
      vi.mocked(agentDb.getAgentById).mockResolvedValue({
        ...mockAgent,
        userId: 'different-user-id',
      });

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'DELETE',
      });

      // Call the handler with params
      await disconnectAgentFromApi(req, res, { 
        params: { 
          agentId: 'agent-123', 
          apiConnectionId: 'api-conn-123' 
        } 
      });

      // Verify the response
      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Forbidden',
      });

      // Verify that disconnectAgentFromApi was not called
      expect(agentDb.disconnectAgentFromApi).not.toHaveBeenCalled();
    });

    it('should return 404 if disconnection fails', async () => {
      // Mock the disconnectAgentFromApi function to return false
      vi.mocked(agentDb.disconnectAgentFromApi).mockResolvedValue(false);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'DELETE',
      });

      // Call the handler with params
      await disconnectAgentFromApi(req, res, { 
        params: { 
          agentId: 'agent-123', 
          apiConnectionId: 'api-conn-123' 
        } 
      });

      // Verify the response
      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Connection not found or deletion failed',
      });
    });
  });
}); 