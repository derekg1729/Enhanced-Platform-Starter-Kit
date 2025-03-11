import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import AgentEditForm from '@/components/agent/AgentEditForm';
import { Agent } from '@/components/agent/AgentCard';
import { useRouter } from 'next/navigation';

// Mock the next/navigation router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('AgentEditForm', () => {
  const mockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  const mockApiConnections = [
    { id: 'conn-1', name: 'OpenAI Connection', service: 'openai' },
    { id: 'conn-2', name: 'Claude Connection', service: 'anthropic' }
  ];

  const mockAgent: Agent = {
    id: 'test-agent-id',
    name: 'Test Agent',
    description: 'Test description',
    systemPrompt: 'You are a helpful assistant',
    model: 'gpt-3.5-turbo',
    temperature: '0.7',
    maxTokens: 2000,
    createdAt: new Date().toISOString(),
    status: 'active',
    apiConnectionId: 'conn-1'
  };

  it('renders the form with agent data', async () => {
    // Mock API connections fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiConnections,
    });
    
    render(<AgentEditForm agent={mockAgent} />);
    
    expect(screen.getByLabelText(/name/i)).toHaveValue('Test Agent');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Test description');
    expect(screen.getByLabelText(/system prompt/i)).toHaveValue('You are a helpful assistant');
    // Model is a select, so we can't check its value directly
    expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument();
    
    // Wait for API connections to load
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/api-connections');
    });
  });

  it('validates required fields', async () => {
    // Mock API connections fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiConnections,
    });
    
    render(<AgentEditForm agent={mockAgent} />);
    
    // Clear required fields
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /update agent/i }));
    
    // Check for validation errors
    expect(await screen.findByText('Name is required')).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    // Mock API connections fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiConnections,
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    
    render(<AgentEditForm agent={mockAgent} />);
    
    // Wait for API connections to load
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/api-connections');
    });
    
    // Update form fields
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Updated Agent' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Updated description' } });
    fireEvent.change(screen.getByLabelText('System Prompt'), { target: { value: 'You are a helpful assistant' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /update agent/i }));
    
    // Wait for all async operations to complete
    await waitFor(() => {
      // Check that fetch was called with the right arguments
      expect(fetch).toHaveBeenCalledWith(`/api/agents/${mockAgent.id}`, expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }));
      
      // Check that router methods were called
      expect(mockRouter.push).toHaveBeenCalledWith('/app/agents');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it('handles API errors', async () => {
    // Mock API connections fetch success but form submission error
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiConnections,
    }).mockRejectedValueOnce(new Error('API Error'));
    
    render(<AgentEditForm agent={mockAgent} />);
    
    // Wait for API connections to load
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/api-connections');
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /update agent/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('API Error');
    });
  });
  
  it('shows error when API connections cannot be loaded', async () => {
    // Mock API connections fetch failure
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Failed to load API connections'));
    
    render(<AgentEditForm agent={mockAgent} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load API connections. Please refresh the page and try again.')).toBeInTheDocument();
    });
  });
}); 