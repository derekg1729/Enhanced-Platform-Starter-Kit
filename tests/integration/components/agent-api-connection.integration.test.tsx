import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import AgentApiConnectionManager from '../../../components/agent/AgentApiConnectionManager';

// Mock the useRouter hook
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

// Set up MSW server
const server = setupServer(
  // Mock the GET request for connected API connections
  http.get('/api/agents/:agentId/api-connections', () => {
    return HttpResponse.json([
      {
        id: 'conn-1',
        name: 'Test OpenAI Connection',
        service: 'openai',
        createdAt: new Date().toISOString(),
      },
    ]);
  }),

  // Mock the GET request for available API connections
  http.get('/api/api-connections', () => {
    return HttpResponse.json([
      {
        id: 'conn-1',
        name: 'Test OpenAI Connection',
        service: 'openai',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'conn-2',
        name: 'Another API Connection',
        service: 'anthropic',
        createdAt: new Date().toISOString(),
      },
    ]);
  }),

  // Mock the DELETE request for disconnecting an API connection
  http.delete('/api/agents/:agentId/api-connections/:apiConnectionId', ({ params }) => {
    // Return 404 for non-existent agent
    if (params.agentId === 'non-existent-agent') {
      return new HttpResponse(
        JSON.stringify({ error: 'Agent not found' }),
        { status: 404 }
      );
    }
    
    // Return 400 for existing connection error
    if (params.apiConnectionId === 'existing-connection') {
      return new HttpResponse(
        JSON.stringify({ error: 'Connection already exists' }),
        { status: 400 }
      );
    }
    
    return HttpResponse.json({ success: true });
  }),

  // Mock the POST request for connecting an API connection
  http.post('/api/agents/:agentId/api-connections/:apiConnectionId', () => {
    return HttpResponse.json({ success: true });
  }),
);

describe('AgentApiConnectionManager', () => {
  // Start the server before tests
  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
    
    // Mock window.confirm
    Object.defineProperty(window, 'confirm', {
      writable: true,
      value: vi.fn().mockImplementation(() => true),
    });
    
    // Mock window.alert for error messages
    Object.defineProperty(window, 'alert', {
      writable: true,
      value: vi.fn(),
    });
  });

  // Reset handlers after each test
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  // Close the server after all tests
  afterAll(() => {
    server.close();
  });

  it('should display connected API connections', async () => {
    render(<AgentApiConnectionManager agentId="test-agent" />);
    
    // Wait for the API connections to load
    await waitFor(() => {
      expect(screen.getByText('Test OpenAI Connection')).toBeInTheDocument();
    });
    
    // Check that the service is displayed
    expect(screen.getByText(/Service: openai/)).toBeInTheDocument();
  });

  it('should handle error when disconnecting from a non-existent agent', async () => {
    // Render the component with a non-existent agent ID
    render(<AgentApiConnectionManager agentId="non-existent-agent" />);
    
    // Wait for the API connections to load
    await waitFor(() => {
      expect(screen.getByText('Test OpenAI Connection')).toBeInTheDocument();
    });
    
    // Click the disconnect button
    fireEvent.click(screen.getByText('Disconnect'));
    
    // Verify window.confirm was called
    expect(window.confirm).toHaveBeenCalled();
    
    // Wait for the alert to be called with the error message
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to disconnect API connection. Please try again.');
    });
  });

  it('should handle error when a connection already exists', async () => {
    // Mock the specific API connection ID that will return a 400 error
    server.use(
      http.delete('/api/agents/test-agent/api-connections/conn-1', () => {
        return new HttpResponse(
          JSON.stringify({ error: 'Connection already exists' }),
          { status: 400 }
        );
      })
    );
    
    // Render the component
    render(<AgentApiConnectionManager agentId="test-agent" />);
    
    // Wait for the API connections to load
    await waitFor(() => {
      expect(screen.getByText('Test OpenAI Connection')).toBeInTheDocument();
    });
    
    // Click the disconnect button
    fireEvent.click(screen.getByText('Disconnect'));
    
    // Verify window.confirm was called
    expect(window.confirm).toHaveBeenCalled();
    
    // Wait for the alert to be called with the error message
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to disconnect API connection. Please try again.');
    });
  });
}); 