import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AgentEditForm from '@/components/agent/AgentEditForm';
import { Agent } from '@/components/agent/AgentCard';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('AgentEditForm', () => {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  it('renders the form with agent data', () => {
    render(<AgentEditForm agent={mockAgent} />);
    
    expect(screen.getByTestId('agent-name-input')).toHaveValue('Test Agent');
    expect(screen.getByTestId('agent-description-input')).toHaveValue('Test description');
    expect(screen.getByTestId('agent-prompt-input')).toHaveValue('You are a helpful assistant');
    expect(screen.getByTestId('agent-model-input')).toHaveValue('gpt-3.5-turbo');
    expect(screen.getByTestId('agent-temperature-input')).toHaveValue('0.7');
    expect(screen.getByTestId('agent-max-tokens-input')).toHaveValue('2000');
  });

  it('validates required fields', async () => {
    render(<AgentEditForm agent={mockAgent} />);
    
    // Clear required fields
    fireEvent.change(screen.getByTestId('agent-name-input'), { target: { value: '' } });
    fireEvent.change(screen.getByTestId('agent-prompt-input'), { target: { value: '' } });
    fireEvent.change(screen.getByTestId('agent-model-input'), { target: { value: '' } });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByTestId('name-error')).toBeInTheDocument();
      expect(screen.getByTestId('prompt-error')).toBeInTheDocument();
      expect(screen.getByTestId('model-error')).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'test-agent-id' }),
    });

    render(<AgentEditForm agent={mockAgent} />);
    
    // Update some fields
    fireEvent.change(screen.getByTestId('agent-name-input'), { target: { value: 'Updated Agent' } });
    fireEvent.change(screen.getByTestId('agent-description-input'), { target: { value: 'Updated description' } });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/agents/${mockAgent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Updated Agent',
          description: 'Updated description',
          systemPrompt: 'You are a helpful assistant',
          model: 'gpt-3.5-turbo',
          temperature: '0.7',
          maxTokens: 2000,
        }),
      });
    });
  });

  it('handles API errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to update agent' }),
    });

    render(<AgentEditForm agent={mockAgent} />);
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to update agent');
    });
  });
}); 