import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import AgentChatWrapper from '../../../../components/agent/AgentChatWrapper';
import { Message } from '../../../../components/agent/AgentChatInterface';

// Mock the AgentChatInterface component
vi.mock('../../../../components/agent/AgentChatInterface', () => {
  return {
    __esModule: true,
    default: ({ 
      agentId, 
      messages, 
      isLoading, 
      error, 
      onSendMessage 
    }: { 
      agentId: string; 
      messages: Message[]; 
      isLoading?: boolean; 
      error?: string; 
      onSendMessage: (message: string) => void;
    }) => (
      <div data-testid="agent-chat-interface">
        <div data-testid="agent-id">{agentId}</div>
        <div data-testid="message-count">{messages.length}</div>
        <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</div>
        {error && <div data-testid="error-message">{error}</div>}
        <button 
          data-testid="send-button" 
          onClick={() => onSendMessage('Test message')}
        >
          Send
        </button>
      </div>
    ),
  };
});

describe('AgentChatWrapper', () => {
  const initialMessages: Message[] = [
    {
      id: '1',
      content: 'Hello! I am your assistant.',
      role: 'assistant',
      timestamp: new Date().toISOString()
    }
  ];

  it('renders the AgentChatInterface with initial messages', () => {
    render(<AgentChatWrapper agentId="test-agent-123" initialMessages={initialMessages} />);
    
    expect(screen.getByTestId('agent-chat-interface')).toBeInTheDocument();
    expect(screen.getByTestId('agent-id')).toHaveTextContent('test-agent-123');
    expect(screen.getByTestId('message-count')).toHaveTextContent('1');
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
  });

  it('handles sending a message', async () => {
    render(<AgentChatWrapper agentId="test-agent-123" initialMessages={initialMessages} />);
    
    // Initial state
    expect(screen.getByTestId('message-count')).toHaveTextContent('1');
    
    // Send a message
    fireEvent.click(screen.getByTestId('send-button'));
    
    // Should show loading state
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');
    
    // Wait for the response
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    }, { timeout: 2000 });
    
    // Should have added two messages (user message and assistant response)
    expect(screen.getByTestId('message-count')).toHaveTextContent('3');
  });

  it('handles errors when sending a message', async () => {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    // Mock the Promise.resolve to reject
    const originalSetTimeout = setTimeout;
    vi.spyOn(global, 'setTimeout').mockImplementationOnce((callback) => {
      throw new Error('Test error');
    });
    
    render(<AgentChatWrapper agentId="test-agent-123" initialMessages={initialMessages} />);
    
    // Send a message
    fireEvent.click(screen.getByTestId('send-button'));
    
    // Wait for the error state
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to send message');
    });
    
    // Should have added only the user message
    expect(screen.getByTestId('message-count')).toHaveTextContent('2');
    
    // Restore mocks
    console.error = originalConsoleError;
    vi.spyOn(global, 'setTimeout').mockRestore();
  });
}); 