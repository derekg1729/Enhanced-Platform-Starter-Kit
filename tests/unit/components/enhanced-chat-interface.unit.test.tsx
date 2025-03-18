import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatInterface from '@/components/chat-interface';
import useChat from '@/hooks/use-chat';

// Mock the useChat hook
vi.mock('@/hooks/use-chat', () => ({
  default: vi.fn()
}));

describe('Enhanced Chat Interface', () => {
  beforeEach(() => {
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: false,
      error: null
    });
  });

  it('renders correctly', () => {
    render(
      <ChatInterface 
        agent={{
          id: 'test-agent-id',
          name: 'Test Agent',
          model: 'gpt-4',
          description: 'Test description',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'test-user-id'
        }}
      />
    );
    
    // Check that basic elements are rendered
    expect(screen.getByTestId('agent-info')).toBeInTheDocument();
    expect(screen.getByTestId('messages-container')).toBeInTheDocument();
    expect(screen.getByTestId('input-container')).toBeInTheDocument();
    expect(screen.getByTestId('chat-form')).toBeInTheDocument();
    expect(screen.getByTestId('chat-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });

  it('displays the agent name and model', () => {
    render(
      <ChatInterface 
        agent={{
          id: 'test-agent-id',
          name: 'Test Agent',
          model: 'gpt-4',
          description: 'Test description',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'test-user-id'
        }}
      />
    );
    
    // Check that agent info is displayed correctly
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    // Use querySelector to check for option with value 'gpt-4' instead of direct text
    expect(screen.getByRole('option', { name: 'GPT-4' })).toBeInTheDocument();
  });

  it('handles form submission', () => {
    const mockHandleSubmit = vi.fn(e => e.preventDefault());
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: 'Hello agent',
      setInput: vi.fn(),
      handleSubmit: mockHandleSubmit,
      isLoading: false,
      error: null
    });

    render(
      <ChatInterface 
        agent={{
          id: 'test-agent-id',
          name: 'Test Agent',
          model: 'gpt-4',
          description: 'Test description',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'test-user-id'
        }}
      />
    );
    
    // Submit the form
    const form = screen.getByTestId('chat-form');
    fireEvent.submit(form);
    
    // Check that handleSubmit was called
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('updates input when user types', () => {
    const mockSetInput = vi.fn();
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: '',
      setInput: mockSetInput,
      handleSubmit: vi.fn(),
      isLoading: false,
      error: null
    });

    render(
      <ChatInterface 
        agent={{
          id: 'test-agent-id',
          name: 'Test Agent',
          model: 'gpt-4',
          description: 'Test description',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'test-user-id'
        }}
      />
    );
    
    // Type in the textarea
    const textarea = screen.getByTestId('chat-textarea');
    fireEvent.change(textarea, { target: { value: 'New message' } });
    
    // Check that setInput was called with the new value
    expect(mockSetInput).toHaveBeenCalledWith('New message');
  });

  it('displays user and assistant messages', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [
        { id: 'msg1', role: 'user', content: 'Hello' },
        { id: 'msg2', role: 'assistant', content: 'Hi there!' }
      ],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: false,
      error: null
    });

    render(
      <ChatInterface 
        agent={{
          id: 'test-agent-id',
          name: 'Test Agent',
          model: 'gpt-4',
          description: 'Test description',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'test-user-id'
        }}
      />
    );
    
    // Check that messages are displayed
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [{ id: 'msg1', role: 'user', content: 'Hello' }],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: true,
      error: null
    });

    render(
      <ChatInterface 
        agent={{
          id: 'test-agent-id',
          name: 'Test Agent',
          model: 'gpt-4',
          description: 'Test description',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'test-user-id'
        }}
      />
    );
    
    // Check for loading indicator (status role which is the spinner)
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows placeholder text when no messages exist', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: false,
      error: null
    });

    render(
      <ChatInterface 
        agent={{
          id: 'test-agent-id',
          name: 'Test Agent',
          model: 'gpt-4',
          description: 'Test description',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'test-user-id'
        }}
      />
    );
    
    // Check that placeholder text is displayed
    expect(screen.getByText(/send a message to start chatting with/i)).toBeInTheDocument();
    // Use getAllByText instead of getByText since the agent name appears multiple times
    expect(screen.getAllByText(/Test Agent/i)).toHaveLength(2);
  });

  it('displays error messages', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [
        { id: 'msg1', role: 'user', content: 'Hello' },
        { id: 'msg2', role: 'error', content: 'An error occurred' }
      ],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: false,
      error: 'An error occurred'
    });

    render(
      <ChatInterface 
        agent={{
          id: 'test-agent-id',
          name: 'Test Agent',
          model: 'gpt-4',
          description: 'Test description',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'test-user-id'
        }}
      />
    );
    
    // Check that error message is displayed
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    // Check that it has the error styling - look for text-red-700 class instead of bg-red-100
    const errorMessageContainer = screen.getByText('An error occurred').closest('div');
    expect(errorMessageContainer).toHaveClass('text-red-700');
  });
}); 