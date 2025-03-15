import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AgentCard from '@/components/agent-card';

// Mock the next/link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="next-link">
      {children}
    </a>
  ),
}));

// Mock the BlurImage component
vi.mock('@/components/blur-image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <div data-alt={alt} data-src={src} data-testid="blur-image" />
  ),
}));

// Mock the Lucide React icons
vi.mock('lucide-react', () => ({
  MessageSquare: () => <div data-testid="message-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
}));

// Mock the useRouter hook
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

// Mock the deleteAgent action
vi.mock('@/lib/actions', () => ({
  deleteAgent: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock the toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the useTransition hook
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useTransition: () => [false, (callback: Function) => callback()],
  };
});

describe('AgentCard Component', () => {
  const mockAgent = {
    id: 'agent-123',
    name: 'Test Agent',
    description: 'This is a test agent',
    model: 'gpt-4',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders agent information correctly', () => {
    render(<AgentCard data={mockAgent} />);
    
    // Check if agent name and description are rendered
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('This is a test agent')).toBeInTheDocument();
    
    // Check if the model type is displayed
    expect(screen.getByText('GPT-4')).toBeInTheDocument();
    
    // Check if the image is rendered with correct props
    const image = screen.getByTestId('blur-image');
    expect(image).toHaveAttribute('data-alt', 'Test Agent');
  });

  it('displays a placeholder image when no image is provided', () => {
    render(<AgentCard data={mockAgent} />);
    
    const image = screen.getByTestId('blur-image');
    expect(image).toHaveAttribute('data-src', '/placeholder.png');
  });

  it('renders chat and delete buttons', () => {
    render(<AgentCard data={mockAgent} />);
    
    // Check if chat button is rendered
    const chatButton = screen.getByText('Chat');
    expect(chatButton).toBeInTheDocument();
    expect(screen.getByTestId('message-icon')).toBeInTheDocument();
    
    // Check if delete button is rendered
    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toBeInTheDocument();
    expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
  });

  it('links to the chat page when chat button is clicked', () => {
    render(<AgentCard data={mockAgent} />);
    
    const chatLink = screen.getByText('Chat').closest('a');
    expect(chatLink).toHaveAttribute('href', '/agent/agent-123/chat');
  });

  it('calls deleteAgent when delete button is clicked', async () => {
    const { deleteAgent } = await import('@/lib/actions');
    
    render(<AgentCard data={mockAgent} />);
    
    // Click the delete button
    fireEvent.click(screen.getByText('Delete'));
    
    // Check if deleteAgent was called with the correct ID
    expect(deleteAgent).toHaveBeenCalledWith('agent-123');
  });

  it('shows success toast when agent is deleted successfully', async () => {
    const { deleteAgent } = await import('@/lib/actions');
    const { toast } = await import('sonner');
    
    vi.mocked(deleteAgent).mockResolvedValue({ success: true });
    
    render(<AgentCard data={mockAgent} />);
    
    // Click the delete button
    fireEvent.click(screen.getByText('Delete'));
    
    // Wait for the async operation to complete
    await vi.waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Agent deleted successfully');
    });
  });

  it('shows error toast when agent deletion fails', async () => {
    const { deleteAgent } = await import('@/lib/actions');
    const { toast } = await import('sonner');
    
    vi.mocked(deleteAgent).mockResolvedValue({ error: 'Failed to delete agent' });
    
    render(<AgentCard data={mockAgent} />);
    
    // Click the delete button
    fireEvent.click(screen.getByText('Delete'));
    
    // Wait for the async operation to complete
    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to delete agent');
    });
  });

  it('renders with correct theme-specific styles', () => {
    const { container } = render(<AgentCard data={mockAgent} />);
    
    // Check for theme-specific classes on the main container div
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('dark:border-stone-700');
    expect(card).toHaveClass('dark:hover:border-white');
    
    // Check heading has dark mode styles
    const heading = screen.getByText('Test Agent');
    expect(heading).toHaveClass('dark:text-white');
    
    // Check description has dark mode styles
    const description = screen.getByText('This is a test agent');
    expect(description).toHaveClass('dark:text-stone-400');
  });

  it('displays formatted creation date', () => {
    const today = new Date();
    const mockAgentWithRecentDate = {
      ...mockAgent,
      createdAt: today,
    };
    
    render(<AgentCard data={mockAgentWithRecentDate} />);
    
    // Should display "Created just now" for a very recent date
    expect(screen.getByText(/Created just now/i)).toBeInTheDocument();
  });

  it('handles missing description gracefully', () => {
    const agentWithoutDescription = {
      ...mockAgent,
      description: null,
    };
    
    render(<AgentCard data={agentWithoutDescription} />);
    
    // Should not display any description
    expect(screen.queryByText('This is a test agent')).not.toBeInTheDocument();
    
    // The component should still render without errors
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
  });
}); 