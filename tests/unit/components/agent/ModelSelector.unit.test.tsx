import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import ModelSelector from '@/components/agent/ModelSelector';

describe('ModelSelector', () => {
  const agentId = 'test-agent-123';
  const currentModel = 'gpt-3.5-turbo';
  const onSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch API
    global.fetch = vi.fn();
    
    // Mock API services response with both OpenAI and Anthropic models
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        {
          id: 'openai',
          name: 'OpenAI',
          models: ['gpt-3.5-turbo', 'gpt-4']
        },
        {
          id: 'anthropic',
          name: 'Anthropic',
          models: ['claude-2', 'claude-instant-1']
        }
      ])
    });
    
    // Mock agent connections response with both OpenAI and Anthropic connections
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        {
          id: 'conn-1',
          name: 'My OpenAI Connection',
          service: 'openai'
        },
        {
          id: 'conn-2',
          name: 'My Anthropic Connection',
          service: 'anthropic'
        }
      ])
    });
  });

  it('renders the model selector', async () => {
    render(<ModelSelector agentId={agentId} currentModel={currentModel} onSave={onSave} />);
    
    await waitFor(() => {
      expect(screen.getByText('Model Configuration')).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText('Model')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('displays models from different services', async () => {
    render(<ModelSelector agentId={agentId} currentModel={currentModel} onSave={onSave} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByLabelText('Model')).toBeInTheDocument();
    });
    
    // Check that models from both services are available
    const selectElement = screen.getByLabelText('Model');
    
    // OpenAI models
    expect(screen.getByText('gpt-3.5-turbo')).toBeInTheDocument();
    expect(screen.getByText('gpt-4')).toBeInTheDocument();
    
    // Anthropic models
    expect(screen.getByText('claude-2')).toBeInTheDocument();
    expect(screen.getByText('claude-instant-1')).toBeInTheDocument();
  });

  it('calls the save function with the selected model', async () => {
    render(<ModelSelector agentId={agentId} currentModel={currentModel} onSave={onSave} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByLabelText('Model')).toBeInTheDocument();
    });
    
    // Change the model to an Anthropic model
    fireEvent.change(screen.getByLabelText('Model'), {
      target: { value: 'claude-2' }
    });
    
    // Click save
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Check that onSave was called with the selected model
    expect(onSave).toHaveBeenCalledWith('claude-2');
  });

  it('shows loading state while fetching data', () => {
    // Reset fetch mock to not resolve immediately
    vi.clearAllMocks();
    global.fetch = vi.fn();
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));
    
    render(<ModelSelector agentId={agentId} currentModel={currentModel} onSave={onSave} />);
    
    expect(screen.getByText('Loading models...')).toBeInTheDocument();
  });

  it('shows error state when API requests fail', async () => {
    // Reset fetch mock to reject
    vi.clearAllMocks();
    global.fetch = vi.fn();
    (global.fetch as any).mockRejectedValueOnce(new Error('API error'));
    
    render(<ModelSelector agentId={agentId} currentModel={currentModel} onSave={onSave} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load models. Please try again.')).toBeInTheDocument();
    });
    
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
}); 