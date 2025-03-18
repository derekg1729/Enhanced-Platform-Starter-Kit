import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock the hooks/dependencies first
vi.mock('@/hooks/use-chat', () => ({
  default: vi.fn()
}));

// Import after mocking
import useChat from '@/hooks/use-chat';

// We'll create a mock/stub of the enhanced ChatInterface we plan to implement
const EnhancedChatInterface = ({ agent }: { agent: any }) => {
  // Get the mocked useChat hook values from the mock
  const { messages, input, setInput, handleSubmit, isLoading } = useChat(agent.id);
  
  return (
    <div className="flex flex-col h-full" data-testid="chat-interface">
      {/* Agent info */}
      <div data-testid="agent-info" className="border-b p-4">
        <h2 className="text-xl font-bold">{agent.name}</h2>
        <p className="text-sm text-stone-500">{agent.model}</p>
      </div>

      {/* Messages container */}
      <div data-testid="messages-container" className="flex-1 p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-stone-500">
              Send a message to start chatting with {agent.name}
            </p>
          </div>
        ) : (
          messages.map((message: any) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                data-testid={`message-${message.role}`}
                className={`rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-stone-100 text-stone-800'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input container */}
      <div data-testid="input-container" className="border-t p-4">
        <form 
          onSubmit={handleSubmit} 
          className="flex items-end space-x-2"
          data-testid="chat-form"
        >
          <div className="relative flex-1">
            <textarea
              data-testid="chat-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full rounded-lg border p-2"
              onKeyDown={(e) => {
                // Submit on Enter (without Shift)
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) {
                    handleSubmit(e);
                  }
                }
              }}
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-blue-500 p-2 text-white"
            data-testid="send-button"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

describe('Enhanced Chat Interface', () => {
  const mockAgent = {
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

  it('renders the basic chat interface components', () => {
    // Setup the mock implementation for this test
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(e => e.preventDefault()),
      isLoading: false
    });
    
    render(<EnhancedChatInterface agent={mockAgent} />);
    
    // Check that the main interface elements are rendered
    expect(screen.getByTestId('chat-interface')).toBeInTheDocument();
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
      handleSubmit: vi.fn(e => e.preventDefault()),
      isLoading: false
    });
    
    render(<EnhancedChatInterface agent={mockAgent} />);
    
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
      isLoading: false
    });
    
    render(<EnhancedChatInterface agent={mockAgent} />);
    
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
      isLoading: false
    });
    
    render(<EnhancedChatInterface agent={mockAgent} />);
    
    // Setup user event for keyboard interactions
    const user = userEvent.setup();
    
    // Focus the textarea and press Enter
    const textarea = screen.getByTestId('chat-textarea');
    textarea.focus();
    
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
      isLoading: false
    });
    
    render(<EnhancedChatInterface agent={mockAgent} />);
    
    // Focus the textarea and press Shift+Enter directly
    const textarea = screen.getByTestId('chat-textarea');
    textarea.focus();
    
    // Trigger the keyDown event with shiftKey true
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });
    
    // Check that handleSubmit was not called
    expect(mockHandleSubmit).not.toHaveBeenCalled();
  });

  it('renders messages correctly when they exist', () => {
    const mockMessages = [
      { id: '1', role: 'user', content: 'Hello!' },
      { id: '2', role: 'assistant', content: 'Hi there! How can I help you?' }
    ];
    
    vi.mocked(useChat).mockReturnValue({
      messages: mockMessages,
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(e => e.preventDefault()),
      isLoading: false
    });
    
    render(<EnhancedChatInterface agent={mockAgent} />);
    
    // Check that the messages are rendered using data-testid
    const userMessage = screen.getByTestId('message-user');
    const assistantMessage = screen.getByTestId('message-assistant');
    
    expect(userMessage).toHaveTextContent('Hello!');
    expect(assistantMessage).toHaveTextContent('Hi there! How can I help you?');
  });

  it('disables send button when input is empty', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(e => e.preventDefault()),
      isLoading: false
    });
    
    render(<EnhancedChatInterface agent={mockAgent} />);
    
    // Check that the send button is disabled
    expect(screen.getByTestId('send-button')).toBeDisabled();
  });

  it('disables send button when loading', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: 'Test message',
      setInput: vi.fn(),
      handleSubmit: vi.fn(e => e.preventDefault()),
      isLoading: true
    });
    
    render(<EnhancedChatInterface agent={mockAgent} />);
    
    // Check that the send button is disabled
    expect(screen.getByTestId('send-button')).toBeDisabled();
  });
}); 