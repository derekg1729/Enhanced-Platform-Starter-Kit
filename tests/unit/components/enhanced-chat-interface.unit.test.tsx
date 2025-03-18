import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from '@/components/chat-interface';

// Mock the TextareaAutosize component
vi.mock('react-textarea-autosize', () => ({
  default: (props: any) => <textarea {...props} />,
}));

// Mock the hooks/dependencies first
vi.mock('@/hooks/use-chat', () => ({
  default: vi.fn(),
}));

// Import after mocking
import useChat from '@/hooks/use-chat';

// Define types that match the actual implementation
type SelectAgent = {
  id: string;
  name: string;
  description: string | null;
  model: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
};

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

describe('Enhanced Chat Interface', () => {
  const mockAgent: SelectAgent = {
    id: 'agent-123',
    name: 'Test Agent',
    description: 'This is a test agent',
    model: 'gpt-4',
    userId: 'user-123',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the basic chat interface components', () => {
    // Setup the mock implementation for this test
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: false,
    });

    render(<ChatInterface agent={mockAgent} />);
    
    // Check that the main interface elements are rendered
    expect(screen.getByTestId('agent-info')).toBeInTheDocument();
    expect(screen.getByTestId('messages-container')).toBeInTheDocument();
    expect(screen.getByTestId('input-container')).toBeInTheDocument();
    expect(screen.getByTestId('chat-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });

  it('displays the agent name and model', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: false,
    });

    render(<ChatInterface agent={mockAgent} />);
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('gpt-4')).toBeInTheDocument();
  });

  it('handles form submission', () => {
    const mockHandleSubmit = vi.fn(e => e.preventDefault());
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: 'Test message',
      setInput: vi.fn(),
      handleSubmit: mockHandleSubmit,
      isLoading: false,
    });

    render(<ChatInterface agent={mockAgent} />);
    
    // Submit the form
    fireEvent.submit(screen.getByTestId('chat-form'));
    
    // Check if handleSubmit was called
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('handles Enter key to submit messages', async () => {
    const mockHandleSubmit = vi.fn(e => e.preventDefault());
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: 'Test message',
      setInput: vi.fn(),
      handleSubmit: mockHandleSubmit,
      isLoading: false,
    });

    render(<ChatInterface agent={mockAgent} />);
    
    // Setup user event for keyboard interactions
    const textarea = screen.getByTestId('chat-textarea');
    
    // Trigger the keyDown event directly
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: false });
    
    // Check if handleSubmit was called
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('does not submit on Shift+Enter', async () => {
    const mockHandleSubmit = vi.fn(e => e.preventDefault());
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: 'Test message',
      setInput: vi.fn(),
      handleSubmit: mockHandleSubmit,
      isLoading: false,
    });

    render(<ChatInterface agent={mockAgent} />);
    
    // Focus the textarea and press Shift+Enter directly
    const textarea = screen.getByTestId('chat-textarea');
    
    // Trigger the keyDown event with shiftKey true
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });
    
    // Check that handleSubmit was not called
    expect(mockHandleSubmit).not.toHaveBeenCalled();
  });

  it('renders messages correctly when they exist', () => {
    const mockMessages: Message[] = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there!' },
      { id: '3', role: 'user', content: 'How are you?' }
    ];
    
    vi.mocked(useChat).mockReturnValue({
      messages: mockMessages,
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: false,
    });

    render(<ChatInterface agent={mockAgent} />);
    
    // Check that the messages are rendered using data-testid
    const userMessages = screen.getAllByTestId('message-user');
    const assistantMessage = screen.getByTestId('message-assistant');
    
    expect(userMessages).toHaveLength(2);
    expect(userMessages[0]).toHaveTextContent('Hello');
    expect(assistantMessage).toHaveTextContent('Hi there!');
  });

  it('disables send button when input is empty', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: false,
    });

    render(<ChatInterface agent={mockAgent} />);
    
    // Check that the send button is disabled
    expect(screen.getByTestId('send-button')).toBeDisabled();
  });

  it('disables send button when loading', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: 'Test message',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: true,
    });

    render(<ChatInterface agent={mockAgent} />);
    
    // Check that the send button is disabled
    expect(screen.getByTestId('send-button')).toBeDisabled();
  });

  it('shows loading indicator when isLoading is true', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: true,
    });

    render(<ChatInterface agent={mockAgent} />);
    
    // Look for the loading spinner instead of a specific test ID
    const spinner = document.querySelector('svg.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
}); 