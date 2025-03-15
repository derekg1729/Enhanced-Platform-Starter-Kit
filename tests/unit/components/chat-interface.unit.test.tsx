import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ChatInterface from '@/components/chat-interface';
import { Agent } from '@/lib/schema';

// Mock the sendMessage function
const mockSendMessage = vi.fn();
vi.mock('@/lib/actions', () => ({
  sendMessage: vi.fn(),
}));

// Mock the useChat hook
vi.mock('@/hooks/use-chat', () => ({
  default: () => ({
    messages: [
      { id: '1', role: 'system', content: 'I am an AI assistant.' },
      { id: '2', role: 'user', content: 'Hello!' },
      { id: '3', role: 'assistant', content: 'Hi there! How can I help you?' },
    ],
    input: 'Test message',
    setInput: vi.fn(),
    handleSubmit: mockSendMessage,
    isLoading: false,
  }),
}));

describe('ChatInterface Component', () => {
  const mockAgent: Agent = {
    id: 'agent-123',
    name: 'Test Agent',
    description: 'This is a test agent',
    model: 'gpt-4',
    userId: 'user-123',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the chat interface with agent information', () => {
    render(<ChatInterface agent={mockAgent} />);
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('gpt-4')).toBeInTheDocument();
  });

  it('displays chat messages correctly', () => {
    render(<ChatInterface agent={mockAgent} />);
    
    // Check if user message is displayed
    expect(screen.getByText('Hello!')).toBeInTheDocument();
    
    // Check if assistant message is displayed
    expect(screen.getByText('Hi there! How can I help you?')).toBeInTheDocument();
  });

  it('renders the message input field', () => {
    render(<ChatInterface agent={mockAgent} />);
    
    const inputField = screen.getByPlaceholderText('Type your message...');
    expect(inputField).toBeInTheDocument();
  });

  it('calls handleSubmit when send button is clicked', () => {
    render(<ChatInterface agent={mockAgent} />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    expect(mockSendMessage).toHaveBeenCalled();
  });

  it('displays user and assistant messages with different styling', () => {
    render(<ChatInterface agent={mockAgent} />);
    
    const userMessage = screen.getByText('Hello!').closest('div');
    const assistantMessage = screen.getByText('Hi there! How can I help you?').closest('div');
    
    // User message should be right-aligned
    expect(userMessage).toHaveClass('ml-auto');
    
    // Assistant message should be left-aligned
    expect(assistantMessage).toHaveClass('mr-auto');
  });

  it('has the correct structure and styling', () => {
    const { container } = render(<ChatInterface agent={mockAgent} />);
    
    // Check for messages container
    const messagesContainer = container.querySelector('[data-testid="messages-container"]');
    expect(messagesContainer).toBeInTheDocument();
    
    // Check for input container
    const inputContainer = container.querySelector('[data-testid="input-container"]');
    expect(inputContainer).toBeInTheDocument();
    
    // Check for agent info section
    const agentInfo = container.querySelector('[data-testid="agent-info"]');
    expect(agentInfo).toBeInTheDocument();
  });
}); 