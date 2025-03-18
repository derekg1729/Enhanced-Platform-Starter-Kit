import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApiConnectionsList from '@/components/api-connections-list';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/lib/actions', () => ({
  getApiConnections: vi.fn(),
  deleteApiConnection: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock window.confirm
const originalConfirm = window.confirm;

// Import mocks after they've been defined
import { getApiConnections, deleteApiConnection } from '@/lib/actions';

describe('ApiConnectionsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn();
  });

  afterEach(() => {
    window.confirm = originalConfirm;
  });

  it('shows loading state initially', () => {
    // Mock API connections loading
    vi.mocked(getApiConnections).mockImplementation(() => {
      return new Promise(resolve => {
        // Don't resolve immediately to keep the component in loading state
        setTimeout(() => {
          resolve([]);
        }, 1000);
      });
    });

    render(<ApiConnectionsList />);
    
    // Check loading indicator
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('animate-spin');
  });

  it('shows empty state when no connections are found', async () => {
    // Mock empty API connections
    vi.mocked(getApiConnections).mockResolvedValue([]);

    render(<ApiConnectionsList />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('No API Connections')).toBeInTheDocument();
      expect(screen.getByText('Add an API key to get started with your agents.')).toBeInTheDocument();
    });
  });

  it('renders a list of API connections', async () => {
    // Mock API connections
    const mockConnections = [
      {
        id: 'conn-1',
        service: 'openai',
        name: 'OpenAI Key',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        hasKey: true,
      },
      {
        id: 'conn-2',
        service: 'anthropic',
        name: 'Anthropic Key',
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02'),
        hasKey: true,
      },
    ];

    vi.mocked(getApiConnections).mockResolvedValue(mockConnections);

    render(<ApiConnectionsList />);
    
    // Wait for loading to complete
    await waitFor(() => {
      // Check title
      expect(screen.getByText('Your API Connections')).toBeInTheDocument();
      
      // Check connection items
      expect(screen.getByText('OpenAI Key')).toBeInTheDocument();
      expect(screen.getByText('Anthropic Key')).toBeInTheDocument();
      
      // Check service names
      expect(screen.getByText('Openai')).toBeInTheDocument();
      expect(screen.getByText('Anthropic')).toBeInTheDocument();
      
      // Check delete buttons
      expect(screen.getAllByText('Delete')).toHaveLength(2);
    });
  });

  it('deletes a connection when delete button is clicked and confirmed', async () => {
    // Mock API connections
    const mockConnections = [
      {
        id: 'conn-1',
        service: 'openai',
        name: 'OpenAI Key',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        hasKey: true,
      },
    ];

    vi.mocked(getApiConnections).mockResolvedValue(mockConnections);
    vi.mocked(deleteApiConnection).mockResolvedValue({ success: true });
    vi.mocked(window.confirm).mockReturnValue(true);

    render(<ApiConnectionsList />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('OpenAI Key')).toBeInTheDocument();
    });
    
    // Click delete button
    fireEvent.click(screen.getByText('Delete'));
    
    // Verify confirm was called
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this API connection?');
    
    // Verify deleteApiConnection was called
    expect(deleteApiConnection).toHaveBeenCalledWith('conn-1');
    
    // Wait for deletion to complete
    await waitFor(() => {
      // Verify toast success was called
      expect(toast.success).toHaveBeenCalledWith('API connection deleted successfully');
    });
  });

  it('does not delete a connection when delete is not confirmed', async () => {
    // Mock API connections
    const mockConnections = [
      {
        id: 'conn-1',
        service: 'openai',
        name: 'OpenAI Key',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        hasKey: true,
      },
    ];

    vi.mocked(getApiConnections).mockResolvedValue(mockConnections);
    vi.mocked(window.confirm).mockReturnValue(false);

    render(<ApiConnectionsList />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('OpenAI Key')).toBeInTheDocument();
    });
    
    // Click delete button
    fireEvent.click(screen.getByText('Delete'));
    
    // Verify confirm was called
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this API connection?');
    
    // Verify deleteApiConnection was NOT called
    expect(deleteApiConnection).not.toHaveBeenCalled();
  });

  it('shows an error toast when deletion fails', async () => {
    // Mock API connections
    const mockConnections = [
      {
        id: 'conn-1',
        service: 'openai',
        name: 'OpenAI Key',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        hasKey: true,
      },
    ];

    vi.mocked(getApiConnections).mockResolvedValue(mockConnections);
    vi.mocked(deleteApiConnection).mockResolvedValue({ error: 'Failed to delete API connection' });
    vi.mocked(window.confirm).mockReturnValue(true);

    render(<ApiConnectionsList />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('OpenAI Key')).toBeInTheDocument();
    });
    
    // Click delete button
    fireEvent.click(screen.getByText('Delete'));
    
    // Wait for deletion to complete
    await waitFor(() => {
      // Verify toast error was called
      expect(toast.error).toHaveBeenCalledWith('Failed to delete API connection');
    });
  });

  it('handles exceptions during deletion', async () => {
    // Mock API connections
    const mockConnections = [
      {
        id: 'conn-1',
        service: 'openai',
        name: 'OpenAI Key',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        hasKey: true,
      },
    ];

    vi.mocked(getApiConnections).mockResolvedValue(mockConnections);
    vi.mocked(deleteApiConnection).mockRejectedValue(new Error('Network error'));
    vi.mocked(window.confirm).mockReturnValue(true);

    render(<ApiConnectionsList />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('OpenAI Key')).toBeInTheDocument();
    });
    
    // Click delete button
    fireEvent.click(screen.getByText('Delete'));
    
    // Wait for deletion to complete
    await waitFor(() => {
      // Verify toast error was called
      expect(toast.error).toHaveBeenCalledWith('Failed to delete API connection');
    });
  });

  it('disables the delete button during deletion', async () => {
    // Mock API connections
    const mockConnections = [
      {
        id: 'conn-1',
        service: 'openai',
        name: 'OpenAI Key',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        hasKey: true,
      },
    ];

    vi.mocked(getApiConnections).mockResolvedValue(mockConnections);
    vi.mocked(deleteApiConnection).mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ success: true });
        }, 100);
      });
    });
    vi.mocked(window.confirm).mockReturnValue(true);

    render(<ApiConnectionsList />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('OpenAI Key')).toBeInTheDocument();
    });
    
    // Click delete button
    fireEvent.click(screen.getByText('Delete'));
    
    // Verify button is disabled during deletion
    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    
    // Wait for deletion to complete
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('handles errors when loading connections', async () => {
    // Mock API connections loading error
    vi.mocked(getApiConnections).mockRejectedValue(new Error('Failed to load connections'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ApiConnectionsList />);
    
    // Wait for loading to complete
    await waitFor(() => {
      // Verify toast error was called
      expect(toast.error).toHaveBeenCalledWith('Failed to load API connections');
      
      // Should show empty state
      expect(screen.getByText('No API Connections')).toBeInTheDocument();
    });
  });
}); 