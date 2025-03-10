import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
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
  temperature: '0.7', // String to match the type in the database
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
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAgentApiConnection = true; // Boolean to match the return type of connectAgentToApi

describe('Agent API Connections API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/agents/:agentId/api-connections/:apiConnectionId', () => {
    it('should connect an agent to an API connection', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the agent and API connection retrieval
      vi.mocked(agentDb.getAgentById).mockResolvedValue(mockAgent);
      vi.mocked(agentDb.getApiConnectionById).mockResolvedValue(mockApiConnection);

      // Mock the connection
      vi.mocked(agentDb.connectAgentToApi).mockResolvedValue(mockAgentApiConnection);

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
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual({ success: true });

      // Check that the functions were called with the correct parameters
      expect(agentDb.getAgentById).toHaveBeenCalledWith('agent-123', 'user-123');
      expect(agentDb.getApiConnectionById).toHaveBeenCalledWith('api-conn-123', 'user-123');
      expect(agentDb.connectAgentToApi).toHaveBeenCalledWith('agent-123', 'api-conn-123', 'user-123');
    });

    it('should return 401 if the user is not authenticated', async () => {
      // Mock the session (no user)
      vi.mocked(getServerSession).mockResolvedValue(null);

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
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: 'Unauthorized' });

      // Check that the functions were not called
      expect(agentDb.getAgentById).not.toHaveBeenCalled();
      expect(agentDb.getApiConnectionById).not.toHaveBeenCalled();
      expect(agentDb.connectAgentToApi).not.toHaveBeenCalled();
    });

    it('should return 404 if the agent is not found', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the agent retrieval (not found)
      vi.mocked(agentDb.getAgentById).mockResolvedValue(null);

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
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({ error: 'Agent not found' });

      // Check that the functions were called with the correct parameters
      expect(agentDb.getAgentById).toHaveBeenCalledWith('agent-123', 'user-123');
      expect(agentDb.getApiConnectionById).not.toHaveBeenCalled();
      expect(agentDb.connectAgentToApi).not.toHaveBeenCalled();
    });

    it('should return 404 if the API connection is not found', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the agent and API connection retrieval
      vi.mocked(agentDb.getAgentById).mockResolvedValue(mockAgent);
      vi.mocked(agentDb.getApiConnectionById).mockResolvedValue(null);

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
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({ error: 'API connection not found' });

      // Check that the functions were called with the correct parameters
      expect(agentDb.getAgentById).toHaveBeenCalledWith('agent-123', 'user-123');
      expect(agentDb.getApiConnectionById).toHaveBeenCalledWith('api-conn-123', 'user-123');
      expect(agentDb.connectAgentToApi).not.toHaveBeenCalled();
    });

    it('should return 403 if the agent does not belong to the user', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the agent retrieval (different user)
      vi.mocked(agentDb.getAgentById).mockResolvedValue({
        ...mockAgent,
        userId: 'different-user-id',
      });

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
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data).toEqual({ error: 'Forbidden' });

      // Check that the functions were called with the correct parameters
      expect(agentDb.getAgentById).toHaveBeenCalledWith('agent-123', 'user-123');
      expect(agentDb.getApiConnectionById).toHaveBeenCalledWith('api-conn-123', 'user-123');
      expect(agentDb.connectAgentToApi).not.toHaveBeenCalled();
    });

    it('should return 400 if the connection fails due to database error or constraint violation', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the agent and API connection retrieval
      vi.mocked(agentDb.getAgentById).mockResolvedValue(mockAgent);
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

  describe('DELETE /api/agents/:agentId/api-connections/:apiConnectionId', () => {
    it('should disconnect an agent from an API connection', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the agent retrieval
      vi.mocked(agentDb.getAgentById).mockResolvedValue(mockAgent);

      // Mock the disconnection
      vi.mocked(agentDb.disconnectAgentFromApi).mockResolvedValue(true);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents/agent-123/api-connections/api-conn-123', {
        method: 'DELETE',
      });

      // Call the API route
      const response = await disconnectAgentFromApi(req, {
        params: {
          agentId: 'agent-123',
          apiConnectionId: 'api-conn-123',
        },
      });

      // Check the response
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ success: true });

      // Check that the functions were called with the correct parameters
      expect(agentDb.getAgentById).toHaveBeenCalledWith('agent-123', 'user-123');
      expect(agentDb.disconnectAgentFromApi).toHaveBeenCalledWith('agent-123', 'api-conn-123', 'user-123');
    });

    it('should return 401 if the user is not authenticated', async () => {
      // Mock the session (no user)
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents/agent-123/api-connections/api-conn-123', {
        method: 'DELETE',
      });

      // Call the API route
      const response = await disconnectAgentFromApi(req, {
        params: {
          agentId: 'agent-123',
          apiConnectionId: 'api-conn-123',
        },
      });

      // Check the response
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: 'Unauthorized' });

      // Check that the functions were not called
      expect(agentDb.getAgentById).not.toHaveBeenCalled();
      expect(agentDb.disconnectAgentFromApi).not.toHaveBeenCalled();
    });

    it('should return 404 if the agent is not found', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the agent retrieval (not found)
      vi.mocked(agentDb.getAgentById).mockResolvedValue(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents/agent-123/api-connections/api-conn-123', {
        method: 'DELETE',
      });

      // Call the API route
      const response = await disconnectAgentFromApi(req, {
        params: {
          agentId: 'agent-123',
          apiConnectionId: 'api-conn-123',
        },
      });

      // Check the response
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({ error: 'Agent not found' });

      // Check that the functions were called with the correct parameters
      expect(agentDb.getAgentById).toHaveBeenCalledWith('agent-123', 'user-123');
      expect(agentDb.disconnectAgentFromApi).not.toHaveBeenCalled();
    });

    it('should return 403 if the agent does not belong to the user', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Mock the agent retrieval (different user)
      vi.mocked(agentDb.getAgentById).mockResolvedValue({
        ...mockAgent,
        userId: 'different-user-id',
      });

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/agents/agent-123/api-connections/api-conn-123', {
        method: 'DELETE',
      });

      // Call the API route
      const response = await disconnectAgentFromApi(req, {
        params: {
          agentId: 'agent-123',
          apiConnectionId: 'api-conn-123',
        },
      });

      // Check the response
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data).toEqual({ error: 'Forbidden' });

      // Check that the functions were called with the correct parameters
      expect(agentDb.getAgentById).toHaveBeenCalledWith('agent-123', 'user-123');
      expect(agentDb.disconnectAgentFromApi).not.toHaveBeenCalled();
    });
  });
}); 