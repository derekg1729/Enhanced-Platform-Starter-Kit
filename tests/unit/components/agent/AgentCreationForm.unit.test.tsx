import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AgentCreationForm from '../../../../components/agent/AgentCreationForm';
import { useRouter } from 'next/navigation';

// Mock the next/navigation router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('AgentCreationForm', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('renders the form with all required fields', () => {
    render(<AgentCreationForm />);
    
    // Check for form elements
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prompt/i)).toBeInTheDocument();
    expect(screen.getByText(/model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument();
    
    // Check for buttons
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create agent/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<AgentCreationForm />);
    
    // Try to submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /create agent/i }));
    
    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/prompt is required/i)).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    // Mock API connections
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/api-connections') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 'test-api-connection-123', name: 'Test OpenAI Connection', service: 'openai' }
          ])
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'new-agent-id' })
      });
    });
    
    const mockOnSubmit = vi.fn();
    const { getByLabelText, getByText } = render(<AgentCreationForm onSubmit={mockOnSubmit} />);
    
    // Wait for API connections to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/api-connections');
    });
    
    // Fill out the form
    fireEvent.change(getByLabelText(/Name/i), { target: { value: 'Test Agent' } });
    fireEvent.change(getByLabelText(/Description/i), { target: { value: 'This is a test agent' } });
    fireEvent.change(getByLabelText(/Prompt/i), { target: { value: 'You are a test agent' } });
    
    // Select an API connection
    const apiConnectionSelect = getByLabelText(/API Connection/i);
    fireEvent.change(apiConnectionSelect, { target: { value: 'test-api-connection-123' } });
    
    // Submit the form
    const submitButton = getByText('Create Agent');
    fireEvent.click(submitButton);
    
    // Check if onSubmit was called with the correct data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Agent',
        description: 'This is a test agent',
        prompt: 'You are a test agent',
        apiConnectionId: 'test-api-connection-123'
      }));
    });
  });

  it('navigates back to agents page when cancel is clicked', () => {
    render(<AgentCreationForm />);
    
    // Click the cancel button
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    
    // Check if router.push was called with the correct path
    expect(mockRouter.push).toHaveBeenCalledWith('/app/agents');
  });

  it('shows loading state during form submission', async () => {
    // Mock API connections
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/api-connections') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 'test-api-connection-123', name: 'Test OpenAI Connection', service: 'openai' }
          ])
        });
      }
      return new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'new-agent-id' })
      }), 1000));
    });
    
    const { getByLabelText, getByText, getByRole } = render(<AgentCreationForm />);
    
    // Wait for API connections to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/api-connections');
    });
    
    // Fill out the form
    fireEvent.change(getByLabelText(/Name/i), { target: { value: 'Test Agent' } });
    fireEvent.change(getByLabelText(/Description/i), { target: { value: 'This is a test agent' } });
    fireEvent.change(getByLabelText(/Prompt/i), { target: { value: 'You are a test agent' } });
    
    // Select an API connection
    const apiConnectionSelect = getByLabelText(/API Connection/i);
    fireEvent.change(apiConnectionSelect, { target: { value: 'test-api-connection-123' } });
    
    // Submit the form
    const submitButton = getByRole('button', { name: /create agent/i });
    fireEvent.click(submitButton);
    
    // Check for loading state - use waitFor to ensure the button is disabled
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('displays error message when form submission fails', async () => {
    // Mock API connections
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/api-connections') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 'test-api-connection-123', name: 'Test OpenAI Connection', service: 'openai' }
          ])
        });
      }
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to create agent' })
      });
    });
    
    const { getByLabelText, getByText, findByText } = render(<AgentCreationForm />);
    
    // Wait for API connections to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/api-connections');
    });
    
    // Fill out the form
    fireEvent.change(getByLabelText(/Name/i), { target: { value: 'Test Agent' } });
    fireEvent.change(getByLabelText(/Description/i), { target: { value: 'This is a test agent' } });
    fireEvent.change(getByLabelText(/Prompt/i), { target: { value: 'You are a test agent' } });
    
    // Select an API connection
    const apiConnectionSelect = getByLabelText(/API Connection/i);
    fireEvent.change(apiConnectionSelect, { target: { value: 'test-api-connection-123' } });
    
    // Submit the form
    const submitButton = getByText('Create Agent');
    fireEvent.click(submitButton);
    
    // Check for error message
    const errorMessage = await findByText(/Failed to create agent/i);
    expect(errorMessage).toBeInTheDocument();
  });

  // Add a test for API connection selection
  test('displays API connection dropdown and requires selection', async () => {
    // Mock API connections
    const mockApiConnections = [
      { id: 'conn-1', name: 'OpenAI Connection', service: 'openai' },
      { id: 'conn-2', name: 'Another API', service: 'other-api' }
    ];
    
    // Mock fetch for API connections
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/api-connections') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiConnections)
        });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    const { getByLabelText, getByText, queryByText } = render(<AgentCreationForm />);
    
    // Wait for API connections to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/api-connections');
    });
    
    // Check if API connection dropdown is displayed
    const apiConnectionSelect = getByLabelText(/API Connection/i);
    expect(apiConnectionSelect).toBeInTheDocument();
    
    // Check if the options are rendered
    const selectElement = apiConnectionSelect as HTMLSelectElement;
    expect(selectElement.options.length).toBeGreaterThan(1); // Including the default option
    
    // Check if validation works when no API connection is selected
    const submitButton = getByText('Create Agent');
    fireEvent.click(submitButton);
    
    // Should show validation error for API connection
    await waitFor(() => {
      expect(queryByText(/API Connection is required/i)).toBeInTheDocument();
    });
  });

  test('submits form with selected API connection', async () => {
    // Mock API connections
    const mockApiConnections = [
      { id: 'conn-1', name: 'OpenAI Connection', service: 'openai' },
      { id: 'conn-2', name: 'Another API', service: 'other-api' }
    ];
    
    // Mock fetch for API connections
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/api-connections') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiConnections)
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'new-agent-id' })
      });
    });
    
    const mockSubmit = vi.fn();
    const { getByLabelText, getByText } = render(<AgentCreationForm onSubmit={mockSubmit} />);
    
    // Wait for API connections to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/api-connections');
    });
    
    // Fill out the form
    fireEvent.change(getByLabelText(/Name/i), { target: { value: 'Test Agent' } });
    fireEvent.change(getByLabelText(/Description/i), { target: { value: 'Test Description' } });
    fireEvent.change(getByLabelText(/Prompt/i), { target: { value: 'Test Prompt' } });
    
    // Select an API connection
    const apiConnectionSelect = getByLabelText(/API Connection/i);
    fireEvent.change(apiConnectionSelect, { target: { value: 'conn-1' } });
    
    // Submit the form
    const submitButton = getByText('Create Agent');
    fireEvent.click(submitButton);
    
    // Check if onSubmit was called with the correct data
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Agent',
        description: 'Test Description',
        prompt: 'Test Prompt',
        apiConnectionId: 'conn-1'
      }));
    });
  });

  test('shows error when API connections cannot be loaded', async () => {
    // Mock fetch to fail
    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to load API connections' })
      });
    });
    
    const { findByText } = render(<AgentCreationForm />);
    
    // Should show error message
    const errorMessage = await findByText(/Failed to load API connections/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('shows message when no API connections are available', async () => {
    // Mock empty API connections list
    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      });
    });
    
    const { findByText } = render(<AgentCreationForm />);
    
    // Should show message about no connections
    const noConnectionsMessage = await findByText(/No API connections available/i);
    expect(noConnectionsMessage).toBeInTheDocument();
  });
}); 