import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
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
    { id: 'conn-1', name: 'OpenAI Connection', service: 'openai' },
    { id: 'conn-2', name: 'Claude Connection', service: 'anthropic' }
  ];

  // Set up MSW server for the success case
  const server = setupServer(
    http.get('/api/api-connections', () => {
      return HttpResponse.json(mockApiConnections);
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
}); 