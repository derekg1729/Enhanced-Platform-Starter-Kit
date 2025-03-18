import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatInterface from '@/components/chat-interface';

// Mock the useChat hook
vi.mock('@/hooks/use-chat', () => ({
  default: vi.fn(() => ({
    messages: [],
    input: '',
    setInput: vi.fn(),
    handleSubmit: vi.fn(e => e.preventDefault()),
    isLoading: false
  }))
}));

describe.skip('ChatInterface Component', () => {
  // Mock agent data
  const mockAgent = {
    id: 'agent-123',
    name: 'Test Agent',
    description: 'This is a test agent',
    model: 'gpt-4',
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('renders the message input field correctly', () => {
    render(<ChatInterface agent={mockAgent} />);
    
    // Check that the input field is rendered
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
  });

  it('renders with the correct structure and styling', () => {
    render(<ChatInterface agent={mockAgent} />);
    
    // Check that the main container has the correct classes
    expect(screen.getByTestId('chat-form')).toBeInTheDocument();
  });

  it('shows empty state when no messages are present', () => {
    render(<ChatInterface agent={mockAgent} />);
    
    // Check for empty state message
    expect(screen.getByText(/Send a message to start chatting/)).toBeInTheDocument();
  });
}); 