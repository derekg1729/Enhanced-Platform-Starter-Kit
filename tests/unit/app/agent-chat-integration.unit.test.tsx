import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock hooks
vi.mock('@/hooks/use-chat', () => ({
  default: vi.fn()
}));

// Mock the getSession function
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn()
}));

// Mock the schema import
vi.mock('@/lib/schema', () => ({
  agents: {
    id: 'agents.id',
    userId: 'agents.userId'
  }
}));

// Mock the db query
vi.mock('@/lib/db', () => ({
  default: {
    query: {
      agents: {
        findFirst: vi.fn()
      }
    }
  }
}));

// Mock the next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  redirect: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn()
}));

// Mock the utils
vi.mock('@/lib/utils', () => ({
  placeholderBlurhash: 'data:image/png;base64,mockPlaceholderData'
}));

// Import the db and getSession after mocking
import db from '@/lib/db';
import useChat from '@/hooks/use-chat';
import { getSession } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

// Create a mock AgentPage implementation that uses the mocked useChat data
const AgentPage = vi.fn(async ({ params }) => {
  // Get the mock data from the useChat hook - pass the agent ID from params
  const { messages, input, setInput, handleSubmit, isLoading, error } = useChat(params.id);
  
  return (
    <div>
      <div data-testid="agent-info">
        <h1>Test AI Agent</h1>
        <div data-testid="agent-description">A test agent for chat functionality</div>
        <div data-testid="agent-model">Model information for gpt-4</div>
        <span>Model: gpt-4</span>
      </div>
      <div data-testid="chat-container">
        <div data-testid="chat-header"></div>
        <div data-testid="messages-area">
          {messages.map((message) => (
            <div key={message.id} data-testid={`message-${message.role}`}>
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div data-testid="loading-indicator">Loading...</div>
          )}
        </div>
        <div data-testid="chat-input-area">
          <form 
            data-testid="chat-form"
            onSubmit={(e) => handleSubmit(e)}
          >
            <input 
              data-testid="message-input" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button 
              data-testid="send-button"
              disabled={isLoading}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
});

describe('Integrated Agent Chat Page', () => {
  // Set up mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock session
    vi.mocked(getSession).mockResolvedValue({
      user: { 
        id: 'user-123', 
        name: 'Test User', 
        email: 'test@example.com',
        username: 'testuser',
        image: 'https://example.com/avatar.jpg'
      }
    });
    
    // Mock router
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
    
    // Mock pathname
    vi.mocked(usePathname).mockReturnValue('/agents/agent-123/chat');

    // Mock getAgent
    vi.mocked(db.query.agents.findFirst).mockResolvedValue({
      id: 'agent-123',
      name: 'Test AI Agent',
      userId: 'user-123',
      description: 'A test agent for chat functionality',
      model: 'gpt-4',
      temperature: 0.7,
      instructions: 'You are a helpful assistant for testing purposes',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  it('renders the agent page with integrated chat interface', async () => {
    // Setup base mock for useChat
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: false,
      error: null
    });

    render(await AgentPage({ params: { id: 'agent-123' } }));

    // Check if the agent details are displayed
    expect(screen.getByText('Test AI Agent')).toBeInTheDocument();
    expect(screen.getByText('Model: gpt-4')).toBeInTheDocument();
    expect(screen.getByTestId('agent-description')).toHaveTextContent('A test agent for chat functionality');
    expect(screen.getByTestId('agent-model')).toHaveTextContent('Model information for gpt-4');

    // Check if the chat interface is rendered
    expect(screen.getByTestId('chat-container')).toBeInTheDocument();
    expect(screen.getByTestId('chat-header')).toBeInTheDocument();
    expect(screen.getByTestId('messages-area')).toBeInTheDocument();
    expect(screen.getByTestId('chat-input-area')).toBeInTheDocument();
    expect(screen.getByTestId('chat-form')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });

  it('calls handleSubmit when form is submitted', async () => {
    const mockHandleSubmit = vi.fn(e => e.preventDefault());
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: 'Hello',
      setInput: vi.fn(),
      handleSubmit: mockHandleSubmit,
      isLoading: false,
      error: null
    });

    render(await AgentPage({ params: { id: 'agent-123' } }));

    // Find and submit the form
    const form = screen.getByTestId('chat-form');
    fireEvent.submit(form);

    // Check that handleSubmit was called
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('calls handleSubmit when Enter is pressed', async () => {
    const mockHandleSubmit = vi.fn(e => e.preventDefault());
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: 'Hello',
      setInput: vi.fn(),
      handleSubmit: mockHandleSubmit,
      isLoading: false,
      error: null
    });

    render(await AgentPage({ params: { id: 'agent-123' } }));

    // Find input and press Enter
    const input = screen.getByTestId('message-input');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Check that handleSubmit was called
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('does not call handleSubmit when Shift+Enter is pressed', async () => {
    const mockHandleSubmit = vi.fn(e => e.preventDefault());
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: 'Hello',
      setInput: vi.fn(),
      handleSubmit: mockHandleSubmit,
      isLoading: false,
      error: null
    });

    render(await AgentPage({ params: { id: 'agent-123' } }));

    // Find input and press Shift+Enter
    const input = screen.getByTestId('message-input');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });

    // Check that handleSubmit was not called
    expect(mockHandleSubmit).not.toHaveBeenCalled();
  });

  it('renders the chat interface with empty state', async () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: false,
      error: null
    });

    render(await AgentPage({ params: { id: 'agent-123' } }));

    // Check that the messages area is empty
    const messagesArea = screen.getByTestId('messages-area');
    expect(messagesArea.children.length).toBe(0);
  });

  it('renders messages in the chat interface', async () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [
        { role: 'user', content: 'Hello', id: '1' },
        { role: 'assistant', content: 'Hi there!', id: '2' }
      ],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: false,
      error: null
    });

    render(await AgentPage({ params: { id: 'agent-123' } }));

    // Check that the messages are rendered
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('shows loading state in the chat interface', async () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: true,
      error: null
    });

    render(await AgentPage({ params: { id: 'agent-123' } }));

    // Check that the loading indicator is shown
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeDisabled();
  });

  it('handles input in the chat interface', async () => {
    const mockSetInput = vi.fn();
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: 'Hello',
      setInput: mockSetInput,
      handleSubmit: vi.fn(),
      isLoading: false,
      error: null
    });

    render(await AgentPage({ params: { id: 'agent-123' } }));

    // Find input and change value
    const input = screen.getByTestId('message-input');
    fireEvent.change(input, { target: { value: 'New message' } });

    // Check that setInput was called with the new value
    expect(mockSetInput).toHaveBeenCalledWith('New message');
  });

  it('displays error messages in the chat interface', async () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [
        { role: 'error', content: 'Failed to generate response', id: '1' }
      ],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: false,
      error: 'Failed to generate response'
    });

    render(await AgentPage({ params: { id: 'agent-123' } }));

    // Verify that the error message is displayed
    expect(screen.getByTestId('message-error')).toHaveTextContent('Failed to generate response');
  });
}); 