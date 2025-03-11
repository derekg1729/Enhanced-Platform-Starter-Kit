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

// Mock fetch
const mockFetchResponse = {
  ok: true,
  json: () => Promise.resolve({ success: true }),
};

describe('ModelSelectorWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch
    global.fetch = vi.fn().mockImplementation(() => Promise.resolve(mockFetchResponse));
    
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn() },
      writable: true,
    });
  });

  it('renders the ModelSelector with the current model', () => {
    render(
      <ModelSelectorWrapper
        agentId="test-agent-123"
        currentModel="gpt-3.5-turbo"
        userId="user-123"
      />
    );
    
    const modelSelector = screen.getByTestId('model-selector');
    expect(modelSelector).toBeInTheDocument();
    
    const modelSelect = screen.getByTestId('model-select');
    expect(modelSelect).toHaveValue('gpt-3.5-turbo');
  });

  it('updates the agent model when save is clicked', async () => {
    render(
      <ModelSelectorWrapper
        agentId="test-agent-123"
        currentModel="gpt-3.5-turbo"
        userId="user-123"
      />
    );
    
    // Click the save button
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    
    // Wait for the fetch call to be made
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/agents/test-agent-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          name: 'placeholder',
          systemPrompt: 'placeholder',
          apiConnectionId: 'placeholder',
        }),
      });
    });
    
    // Verify page reload was called
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    // Mock window.alert
    window.alert = vi.fn();
    
    // Mock fetch to return an error
    global.fetch = vi.fn().mockImplementation(() => 
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