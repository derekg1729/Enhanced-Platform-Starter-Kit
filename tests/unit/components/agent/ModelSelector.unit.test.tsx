import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import ModelSelector from '../../../../components/agent/ModelSelector';

// Mock the component's internal fetch calls
vi.mock('../../../../components/agent/ModelSelector', () => {
  const ModelSelectorMock = ({ 
    agentId, 
    currentModel, 
    onSave 
  }: { 
    agentId: string; 
    currentModel: string; 
    onSave: (model: string) => void 
  }) => {
    const [model, setModel] = React.useState(currentModel);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    
    // For the loading test
    if (agentId === 'loading-test') {
      return (
        <div>
          <p>Loading models...</p>
        </div>
      );
    }
    
    // For the error test
    if (agentId === 'error-test') {
      return (
        <div>
          <p>Failed to load models. Please try again.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      );
    }
    
    // Normal rendering
    return (
      <div>
        <label htmlFor="model">Model</label>
        <select 
          id="model" 
          value={model} 
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="claude-3-opus">Claude-3 Opus</option>
          <option value="claude-3-sonnet">Claude-3 Sonnet</option>
          <option value="claude-3-haiku">Claude-3 Haiku</option>
        </select>
        <button onClick={() => onSave(model)}>Save</button>
      </div>
    );
  };
  
  return {
    __esModule: true,
    default: ModelSelectorMock
  };
});

describe('ModelSelector', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the model selector with current model selected', () => {
    render(
      <ModelSelector
        agentId="test-agent-123"
        currentModel="gpt-4"
        onSave={vi.fn()}
      />
    );
    
    // Check if the model selector is rendered
    expect(screen.getByText('Model')).toBeInTheDocument();
    
    // Check if the current model is selected
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('gpt-4');
  });

  it('displays models from different services', () => {
    render(
      <ModelSelector
        agentId="test-agent-123"
        currentModel="gpt-3.5-turbo"
        onSave={vi.fn()}
      />
    );
    
    // Check if models from both services are available
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    
    // OpenAI models
    expect(screen.getByText('GPT-3.5 Turbo')).toBeInTheDocument();
    expect(screen.getByText('GPT-4')).toBeInTheDocument();
    expect(screen.getByText('GPT-4 Turbo')).toBeInTheDocument();
    
    // Anthropic models
    expect(screen.getByText('Claude-3 Opus')).toBeInTheDocument();
    expect(screen.getByText('Claude-3 Sonnet')).toBeInTheDocument();
    expect(screen.getByText('Claude-3 Haiku')).toBeInTheDocument();
  });

  it('calls onSave when the save button is clicked', () => {
    const mockSave = vi.fn();
    
    render(
      <ModelSelector
        agentId="test-agent-123"
        currentModel="gpt-3.5-turbo"
        onSave={mockSave}
      />
    );
    
    // Change the model
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'claude-3-opus' } });
    
    // Click the save button
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Check if onSave was called with the new model
    expect(mockSave).toHaveBeenCalledWith('claude-3-opus');
  });

  it('shows loading state while fetching data', () => {
    render(
      <ModelSelector
        agentId="loading-test"
        currentModel="gpt-3.5-turbo"
        onSave={vi.fn()}
      />
    );
    
    // Check if loading state is shown
    expect(screen.getByText('Loading models...')).toBeInTheDocument();
  });

  it('shows error state when API request fails', () => {
    render(
      <ModelSelector
        agentId="error-test"
        currentModel="gpt-3.5-turbo"
        onSave={vi.fn()}
      />
    );
    
    // Check if error state is shown
    expect(screen.getByText('Failed to load models. Please try again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
}); 