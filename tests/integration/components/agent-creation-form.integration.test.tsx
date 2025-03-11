import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { useRouter } from 'next/navigation';
import { vi, describe, it, expect, beforeAll, afterEach, afterAll, beforeEach } from 'vitest';
import AgentCreationForm from '@/components/agent/AgentCreationForm';
import { render } from '../../__helpers__/test-utils';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('AgentCreationForm Integration', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  // Mock API connections
  const mockApiConnections = [
    { id: 'test-api-connection-123', name: 'Test OpenAI Connection', service: 'openai' },
    { id: 'test-api-connection-456', name: 'Test Claude Connection', service: 'anthropic' }
  ];

  // Set up MSW server for the success case
  const server = setupServer(
    http.get('/api/api-connections', () => {
      return HttpResponse.json(mockApiConnections);
    }),
    http.post('/api/agents', () => {
      return HttpResponse.json({ id: 'new-agent-id' }, { status: 201 });
    })
  );

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });
  afterAll(() => server.close());

  beforeEach(() => {
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('should render the form with API connections', async () => {
    const { findByLabelText } = render(<AgentCreationForm />);
    
    // Check that the form renders with API connections
    const apiConnectionSelect = await findByLabelText(/api connection/i);
    expect(apiConnectionSelect).toBeInTheDocument();
    
    // Check that the form has the expected fields
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prompt/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument();
    
    // Check that the submit button is present
    expect(screen.getByRole('button', { name: /create agent/i })).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const { findByLabelText, getByRole } = render(<AgentCreationForm />);
    
    // Wait for API connections to load
    await findByLabelText(/api connection/i);
    
    // Submit the form without filling any fields
    fireEvent.click(getByRole('button', { name: /create agent/i }));
    
    // Check for validation errors
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/description is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/prompt is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/api connection is required/i)).toBeInTheDocument();
  });

  it('should redirect to the correct URL after successful form submission', async () => {
    const user = userEvent.setup();
    const { findByLabelText } = render(<AgentCreationForm />);
    
    // Wait for API connections to load
    const apiConnectionSelect = await findByLabelText(/api connection/i);
    
    // Fill out the form
    await user.type(screen.getByLabelText(/name/i), 'Test Agent');
    await user.type(screen.getByLabelText(/description/i), 'This is a test agent');
    await user.type(screen.getByLabelText(/prompt/i), 'You are a test agent');
    
    // Select API connection
    await user.selectOptions(apiConnectionSelect, 'test-api-connection-123');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create agent/i });
    await user.click(submitButton);
    
    // Wait for the form submission to complete with a longer timeout
    await waitFor(() => {
      // Check that the router.push was called with the correct URL
      expect(mockRouter.push).toHaveBeenCalledWith('/agents');
    }, { timeout: 3000 });
  });
}); 