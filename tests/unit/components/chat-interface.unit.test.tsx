import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatInterface from '@/components/chat-interface';
import { SelectAgent } from '@/lib/schema';
import * as useChat from '@/hooks/use-chat';

// Mock useChat hook
vi.mock('@/hooks/use-chat', () => {
  return {
    __esModule: true,
    default: vi.fn(),
  };
});

describe('Chat Interface', () => {
  // Sample agent data
  const mockAgent: SelectAgent = {
    id: 'test-agent',
    name: 'Test Agent',
    description: 'A test agent',
    userId: 'user123',
    model: 'gpt-4',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useChat.default).mockReturnValue({
      messages: [],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: false,
      error: null,
    });
  });

  it('renders properly with no messages', () => {
    render(<ChatInterface agent={mockAgent} />);
    
    // Basic component elements should exist
    expect(screen.getByTestId('messages-container')).toBeInTheDocument();
    expect(screen.getByTestId('input-container')).toBeInTheDocument();
    expect(screen.getByTestId('chat-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
    
    // We no longer show "Send a message to start chatting" text
  });

  it('renders messages correctly', () => {
    // Mock the hook to return messages
    vi.mocked(useChat.default).mockReturnValue({
      messages: [
        { id: '1', role: 'user', content: 'Hello' },
        { id: '2', role: 'assistant', content: 'Hi there!' },
      ],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: false,
      error: null,
    });
    
    render(<ChatInterface agent={mockAgent} />);
    
    // Check if messages are displayed
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    // Mock the hook to show loading state
    vi.mocked(useChat.default).mockReturnValue({
      messages: [{ id: '1', role: 'user', content: 'Hello' }],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: true,
      error: null,
    });
    
    render(<ChatInterface agent={mockAgent} />);
    
    // Check for loading indicator
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
}); 