import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import ModelSelectorWrapper from '../../../../components/agent/ModelSelectorWrapper';

// Mock the ModelSelector component
vi.mock('../../../../components/agent/ModelSelector', () => ({
  default: ({ agentId, currentModel, onSave }: { agentId: string; currentModel: string; onSave: (model: string) => void }) => (
    <div data-testid="model-selector">
      <select 
        data-testid="model-select" 
        defaultValue={currentModel}
        onChange={(e) => onSave(e.target.value)}
      >
        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        <option value="gpt-4">GPT-4</option>
      </select>
      <button data-testid="save-button" onClick={() => onSave('gpt-4')}>Save Model</button>
    </div>
  ),
}));

describe('ModelSelectorWrapper', () => {
  const mockAgentDetails = {
    id: 'test-agent-123',
    name: 'Test Agent',
    description: 'Test description',
    systemPrompt: 'You are a test agent',
    model: 'gpt-3.5-turbo',
    apiConnectionId: 'test-connection-123',
  };

  // Mock fetch response for agent details
  const mockAgentResponse = {
    ok: true,
    json: () => Promise.resolve(mockAgentDetails),
  };

  // Mock fetch response for model update
  const mockUpdateResponse = {
    ok: true,
    json: () => Promise.resolve({ success: true }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch to return agent details first, then update response
    global.fetch = vi.fn()
      .mockImplementationOnce(() => Promise.resolve(mockAgentResponse))
      .mockImplementationOnce(() => Promise.resolve(mockUpdateResponse));
    
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn() },
      writable: true,
    });
  });

  it('fetches agent details and renders the ModelSelector with the current model', async () => {
    render(
      <ModelSelectorWrapper
        agentId="test-agent-123"
        currentModel="gpt-3.5-turbo"
        userId="user-123"
      />
    );
    
    // Initially should show loading state
    expect(screen.getByText('Loading model configuration...')).toBeInTheDocument();
    
    // Wait for agent details to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/agents/test-agent-123');
    });
    
    // After loading, should render the ModelSelector
    await waitFor(() => {
      const modelSelector = screen.getByTestId('model-selector');
      expect(modelSelector).toBeInTheDocument();
    });
    
    const modelSelect = screen.getByTestId('model-select');
    expect(modelSelect).toHaveValue('gpt-3.5-turbo');
  });

  it('updates the agent model with the correct API connection ID when save is clicked', async () => {
    // Mock the fetch response for agent details
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/agents/test-agent-123') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            apiConnectionId: 'test-connection-123',
            name: 'Test Agent',
            systemPrompt: 'You are a test agent'
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    // Render the component
    render(
      <ModelSelectorWrapper
        agentId="test-agent-123"
        currentModel="gpt-3.5-turbo"
        userId="test-user-123"
      />
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByTestId('model-selector')).toBeInTheDocument();
    });

    // Select a new model
    const select = screen.getByTestId('model-select');
    fireEvent.change(select, { target: { value: 'gpt-4' } });

    // Click the save button
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    // Wait for the fetch call to be made with the correct API connection ID
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/agents/test-agent-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          name: 'Test Agent',
          systemPrompt: 'You are a test agent',
          apiConnectionId: 'test-connection-123',
        }),
      });
    });
  });

  it('shows an error message when agent details fetch fails', async () => {
    // Mock fetch to return an error
    global.fetch = vi.fn().mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch agent details' }),
      })
    );
    
    render(
      <ModelSelectorWrapper
        agentId="test-agent-123"
        currentModel="gpt-3.5-turbo"
        userId="user-123"
      />
    );
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to load agent details')).toBeInTheDocument();
    });
    
    // Should show a retry button
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('shows a message when no API connection is found', async () => {
    // Mock the fetch response for agent details with no API connection
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/agents/test-agent-123') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            apiConnectionId: null,
            name: null,
            systemPrompt: null
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    // Render the component
    render(
      <ModelSelectorWrapper
        agentId="test-agent-123"
        currentModel="gpt-3.5-turbo"
        userId="test-user-123"
      />
    );
    
    // Wait for the no API connection message to appear
    await waitFor(() => {
      expect(screen.getByText('Missing agent information. Please refresh the page and try again.')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully when updating the model', async () => {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    // Mock window.alert
    window.alert = vi.fn();
    
    // Mock fetch to return agent details first, then an error for the update
    global.fetch = vi.fn()
      .mockImplementationOnce(() => Promise.resolve(mockAgentResponse))
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Failed to update model' }),
        })
      );
    
    render(
      <ModelSelectorWrapper
        agentId="test-agent-123"
        currentModel="gpt-3.5-turbo"
        userId="user-123"
      />
    );
    
    // Wait for agent details to load
    await waitFor(() => {
      expect(screen.queryByText('Loading model configuration...')).not.toBeInTheDocument();
    });
    
    // Click the save button
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    
    // Wait for the alert to be called
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to update model. Please try again.');
    });
    
    // Verify page reload was not called
    expect(window.location.reload).not.toHaveBeenCalled();
    
    // Restore mocks
    console.error = originalConsoleError;
  });
}); 