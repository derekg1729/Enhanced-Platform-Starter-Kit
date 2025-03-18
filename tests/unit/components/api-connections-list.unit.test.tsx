import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

// Mock BlurImage component
vi.mock('@/components/blur-image', () => ({
  default: ({ alt, src }: { alt: string, src: string }) => (
    <div data-testid="blur-image" data-alt={alt} data-src={src} />
  ),
}));

// Define ApiConnection interface to match the component
interface ApiConnection {
  id: string;
  service: string;
  name: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  hasKey: boolean;
}

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
    
    // Check loading skeleton in grid layout
    const skeletons = screen.getAllByRole('status', { hidden: true });
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no connections are found', async () => {
    // Mock empty API connections
    vi.mocked(getApiConnections).mockResolvedValue([]);

    render(<ApiConnectionsList />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('No API Keys Yet')).toBeInTheDocument();
      expect(screen.getByText('You do not have any API keys yet. Add one to get started with your agents.')).toBeInTheDocument();
    });
  });

  it('renders a grid of API connection cards', async () => {
    // Mock API connections
    const mockConnections = [
      {
        id: 'conn-1',
        service: 'openai',
        name: 'OpenAI Key',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
        hasKey: true,
      },
      {
        id: 'conn-2',
        service: 'anthropic',
        name: 'Anthropic Key',
        createdAt: new Date('2023-01-02T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
        hasKey: true,
      },
    ];

    vi.mocked(getApiConnections).mockResolvedValue(mockConnections);

    render(<ApiConnectionsList />);
    
    // Wait for loading to complete
    await waitFor(() => {
      // Check service names in card titles
      expect(screen.getByText('Openai')).toBeInTheDocument();
      expect(screen.getByText('Anthropic')).toBeInTheDocument();
      
      // Check connection names
      expect(screen.getByText('OpenAI Key')).toBeInTheDocument();
      expect(screen.getByText('Anthropic Key')).toBeInTheDocument();
      
      // Check delete buttons
      expect(screen.getAllByText('Delete')).toHaveLength(2);
      
      // Check images
      const images = screen.getAllByTestId('blur-image');
      expect(images).toHaveLength(2);
      expect(images[0]).toHaveAttribute('data-src', 'https://avatar.vercel.sh/conn-1');
      expect(images[1]).toHaveAttribute('data-src', 'https://avatar.vercel.sh/conn-2');
    });
  });

  it('deletes a connection when delete button is clicked and confirmed', async () => {
    // Mock API connections
    const mockConnections = [
      {
        id: 'conn-1',
        service: 'openai',
        name: 'OpenAI Key',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
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
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
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
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
        hasKey: true,
      },
    ];

    vi.mocked(getApiConnections).mockResolvedValue(mockConnections);
    vi.mocked(deleteApiConnection).mockResolvedValue({ success: false });
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
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
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
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
        hasKey: true,
      },
    ];

    // Create a promise that won't resolve immediately
    let resolveDeletePromise = (value: any) => {}; // Initialize with a default function
    const deletePromise = new Promise((resolve) => {
      resolveDeletePromise = resolve;
    });

    vi.mocked(getApiConnections).mockResolvedValue(mockConnections);
    vi.mocked(deleteApiConnection).mockImplementation(() => deletePromise as Promise<any>);
    vi.mocked(window.confirm).mockReturnValue(true);

    render(<ApiConnectionsList />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('OpenAI Key')).toBeInTheDocument();
    });
    
    // Click delete button
    fireEvent.click(screen.getByText('Delete'));
    
    // Check that the button is disabled and shows loading state
    await waitFor(() => {
      const deleteButton = screen.getByText('Deleting...');
      expect(deleteButton.closest('button')).toBeDisabled();
    });
    
    // Resolve the delete promise
    resolveDeletePromise({ success: true });
    
    // Wait for the deletion to complete
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });
}); 