import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import AgentDashboard from '@/components/agent/AgentDashboard';
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

// Mock the ConfirmationDialog component
vi.mock('@/components/ui/ConfirmationDialog', () => {
  return {
    ConfirmationDialog: vi.fn(({ isOpen, onClose, onConfirm, title, description, confirmText = "Confirm" }) => {
      if (!isOpen) return null;
      return (
        <div data-testid="confirmation-dialog">
          <h2>{title}</h2>
          <p>{description}</p>
          <button onClick={onClose} data-testid="cancel-button">Cancel</button>
          <button onClick={onConfirm} data-testid="confirm-button">{confirmText}</button>
        </div>
      );
    }),
  };
});

// Mock agents data
const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Test Agent 1',
    description: 'Description for test agent 1',
    systemPrompt: 'You are a helpful assistant',
    model: 'gpt-3.5-turbo',
    temperature: '0.7',
    maxTokens: 2000,
    createdAt: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'agent-2',
    name: 'Test Agent 2',
    description: 'Description for test agent 2',
    systemPrompt: 'You are a helpful assistant',
    model: 'gpt-4',
    temperature: '0.5',
    maxTokens: 4000,
    createdAt: new Date().toISOString(),
    status: 'inactive',
  },
];

describe('Agent CRUD Operations', () => {
  // Mock fetch globally
  const originalFetch = global.fetch;
  
  beforeEach(() => {
    // Set up a default mock implementation for fetch
    global.fetch = vi.fn().mockImplementation((url, options) => {
      // Handle DELETE requests
      if (options?.method === 'DELETE') {
        if (url.toString().includes('agent-1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }
      }
      
      // Handle PUT requests
      if (options?.method === 'PUT') {
        if (url.toString().includes('agent-1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ 
              ...mockAgents[0],
              ...JSON.parse(options.body as string)
            }),
          });
        }
      }
      
      // Default response for unhandled requests
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Not implemented in test' }),
      });
    });
  });
  
  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });
  
  describe('AgentDashboard', () => {
    it('renders agents and allows deletion', async () => {
      render(<AgentDashboard agents={mockAgents} isLoading={false} />);
      
      // Check if agents are rendered
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
      expect(screen.getByText('Test Agent 2')).toBeInTheDocument();
      
      // Find delete buttons (there should be two, one for each agent)
      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons.length).toBe(2);
      
      // Click the first delete button
      fireEvent.click(deleteButtons[0]);
      
      // Confirmation dialog should appear
      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
      expect(screen.getByText('Delete Agent')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this agent? This action cannot be undone.')).toBeInTheDocument();
      
      // Confirm deletion
      fireEvent.click(screen.getByTestId('confirm-button'));
      
      // Wait for the deletion to complete
      await waitFor(() => {
        // The fetch should have been called with the correct URL
        expect(global.fetch).toHaveBeenCalledWith('/api/agents/agent-1', {
          method: 'DELETE',
        });
      });
    });
    
    it('handles deletion errors', async () => {
      // Override the fetch mock for this test to return an error
      global.fetch = vi.fn().mockImplementation((url) => {
        if (url.toString().includes('agent-1')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'Server error' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      });
      
      render(<AgentDashboard agents={mockAgents} isLoading={false} />);
      
      // Find delete buttons
      const deleteButtons = screen.getAllByText('Delete');
      
      // Click the first delete button
      fireEvent.click(deleteButtons[0]);
      
      // Confirm deletion
      fireEvent.click(screen.getByTestId('confirm-button'));
      
      // Wait for the error message to appear
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByTestId('error-message').textContent).toContain('Server error');
      });
    });
  });
  
  describe('AgentEditForm', () => {
    it('updates an agent successfully', async () => {
      render(<AgentEditForm agent={mockAgents[0]} />);
      
      // Update the name field
      fireEvent.change(screen.getByTestId('agent-name-input'), {
        target: { value: 'Updated Agent Name' },
      });
      
      // Submit the form
      fireEvent.click(screen.getByTestId('submit-button'));
      
      // Wait for the form submission to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/agents/agent-1', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.any(String),
        });
        
        // Verify the body contains the updated name
        const calls = (global.fetch as any).mock.calls;
        const lastCall = calls[calls.length - 1];
        const requestBody = JSON.parse(lastCall[1].body);
        expect(requestBody.name).toBe('Updated Agent Name');
      });
    });
    
    it('handles update errors', async () => {
      // Override the fetch mock for this test to return an error
      global.fetch = vi.fn().mockImplementation(() => {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Server error' }),
        });
      });
      
      render(<AgentEditForm agent={mockAgents[0]} />);
      
      // Submit the form without changes
      fireEvent.click(screen.getByTestId('submit-button'));
      
      // Wait for the error message to appear
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByTestId('error-message').textContent).toContain('Server error');
      });
    });
  });
}); 