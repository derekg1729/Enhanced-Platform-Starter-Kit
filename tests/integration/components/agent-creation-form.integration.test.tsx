import React from 'react';
import { fireEvent, waitFor, screen } from '@testing-library/react';
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

  // Set up MSW server for the success case
  const server = setupServer(
    http.post('/api/agents', () => {
      return HttpResponse.json(
        {
          id: 'test-agent-id',
          name: 'Test Agent',
          description: 'Test Description',
          systemPrompt: 'Test Prompt',
          model: 'gpt-3.5-turbo',
          temperature: '0.7',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { status: 201 }
      );
    })
  );

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });
  afterAll(() => server.close());

  beforeEach(() => {
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('should validate required fields', async () => {
    render(<AgentCreationForm />);

    // Submit the form without filling any fields
    fireEvent.click(screen.getByRole('button', { name: /create agent/i }));

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeDefined();
      expect(screen.getByText(/description is required/i)).toBeDefined();
      expect(screen.getByText(/prompt is required/i)).toBeDefined();
    });

    // Verify that the API was not called
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    // Mock the fetch function to return an error
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' }),
      })
    );

    render(<AgentCreationForm />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Agent' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/prompt/i), { target: { value: 'Test Prompt' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create agent/i }));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to create agent/i)).toBeDefined();
    });

    // Verify that the router was not called
    expect(mockRouter.push).not.toHaveBeenCalled();

    // Restore the original fetch
    global.fetch = originalFetch;
  });

  it('should successfully submit the form and redirect', async () => {
    render(<AgentCreationForm />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Agent' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/prompt/i), { target: { value: 'Test Prompt' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create agent/i }));

    // Wait for the form submission to complete
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/agents');
    });
  });
}); 