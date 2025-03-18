import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface from '@/components/chat-interface';
import { SelectAgent } from '@/lib/schema';
import { sendMessage } from '@/lib/actions';
import * as useChat from '@/hooks/use-chat';

// Mock the sendMessage function
vi.mock('@/lib/actions', () => ({
  sendMessage: vi.fn(),
}));

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: vi.fn().mockReturnValue('mock-id-123'),
}));

// Mock useChat hook
vi.mock('@/hooks/use-chat', () => {
  return {
    __esModule: true,
    default: vi.fn(),
  };
});

// Mock the agent
const mockAgent: SelectAgent = {
  id: 'agent-123',
  name: 'Test Agent',
  description: 'A test agent for unit testing',
  userId: 'user-123',
  model: 'claude-3-sonnet',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Chat Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation for useChat
    vi.mocked(useChat.default).mockReturnValue({
      messages: [],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: false,
      error: null,
    });
  });

  it('should display user message and AI response when message is sent', async () => {
    // Mock useChat to return messages and other state
    vi.mocked(useChat.default).mockReturnValue({
      messages: [
        { id: 'msg1', role: 'user', content: 'Hello, agent!' },
        { id: 'msg2', role: 'assistant', content: 'This is a response from the AI.' },
      ],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: false,
      error: null,
    });

    // Render the component
    render(<ChatInterface agent={mockAgent} />);

    // Check that the messages are displayed
    const userMessage = screen.getByText('Hello, agent!');
    expect(userMessage).toBeInTheDocument();

    const aiResponse = screen.getByText('This is a response from the AI.');
    expect(aiResponse).toBeInTheDocument();
  });

  it('should handle errors when sending messages', async () => {
    // Mock useChat to return an error message
    vi.mocked(useChat.default).mockReturnValue({
      messages: [
        { id: 'msg1', role: 'user', content: 'This will cause an error' },
        { id: 'msg2', role: 'error', content: 'Error: Failed to generate AI response' },
      ],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: false,
      error: 'Failed to generate AI response',
    });

    // Render the component
    render(<ChatInterface agent={mockAgent} />);

    // Check that the user message is displayed
    const userMessage = screen.getByText('This will cause an error');
    expect(userMessage).toBeInTheDocument();

    // Check that an error message is displayed
    const errorMessage = screen.getByText('Error: Failed to generate AI response');
    expect(errorMessage).toBeInTheDocument();
  });

  it('should show a loading indicator while waiting for a response', async () => {
    // Mock useChat to indicate loading state
    vi.mocked(useChat.default).mockReturnValue({
      messages: [
        { id: 'msg1', role: 'user', content: 'Hello, agent!' },
      ],
      input: '',
      setInput: vi.fn(),
      handleSubmit: vi.fn(),
      isLoading: true,
      error: null,
    });

    // Render the component
    render(<ChatInterface agent={mockAgent} />);

    // Check that the loading indicator is displayed
    const loadingIndicator = screen.getByRole('status');
    expect(loadingIndicator).toBeInTheDocument();
  });
}); 