import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import AgentChatWrapper from '@/components/agent/AgentChatWrapper';
import { Message } from '@/components/agent/AgentChatInterface';

// Helper to create a mock Response with a ReadableStream
function createMockStreamResponse(chunks: string[]) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        // Add a small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}

describe('AgentChatWrapper with streaming', () => {
  const agentId = 'test-agent-123';
  const initialMessages: Message[] = [
    {
      id: '1',
      content: 'Hello! I am your assistant. How can I help you today?',
      role: 'assistant',
      timestamp: new Date().toISOString()
    }
  ];

  // Store the original fetch
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = vi.fn();
  });

  afterEach(() => {
    // Restore original fetch after each test
    global.fetch = originalFetch;
  });

  it('should display streaming messages in real-time', async () => {
    // Mock the fetch response with a stream
    global.fetch = vi.fn().mockResolvedValue(
      createMockStreamResponse(['This ', 'is ', 'a ', 'streaming ', 'response.'])
    );

    render(<AgentChatWrapper agentId={agentId} initialMessages={initialMessages} />);

    // Send a message
    const input = screen.getByTestId('message-input');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    // Verify user message is displayed
    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Wait for the streaming response to complete
    await waitFor(() => {
      const assistantMessages = screen.getAllByTestId('assistant-message');
      const lastMessage = assistantMessages[assistantMessages.length - 1];
      return lastMessage.textContent?.includes('This is a streaming response.');
    }, { timeout: 2000 });

    // Verify fetch was called with the correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/agents/${agentId}/chat`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ message: 'Test message' }),
      })
    );
  });

  it('should handle errors during streaming', async () => {
    // Mock fetch to reject with an error
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<AgentChatWrapper agentId={agentId} initialMessages={initialMessages} />);

    // Send a message
    const input = screen.getByTestId('message-input');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message').textContent).toContain('Failed to send message');
    });
  });

  it('should handle conversation history', async () => {
    // First response
    global.fetch = vi.fn().mockResolvedValueOnce(
      createMockStreamResponse(['First response.'])
    );

    render(<AgentChatWrapper agentId={agentId} initialMessages={initialMessages} />);

    // Send first message
    const input = screen.getByTestId('message-input');
    fireEvent.change(input, { target: { value: 'First message' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    // Wait for first response
    await waitFor(() => {
      const assistantMessages = screen.getAllByTestId('assistant-message');
      const lastMessage = assistantMessages[assistantMessages.length - 1];
      return lastMessage.textContent?.includes('First response.');
    }, { timeout: 2000 });

    // Mock second response
    global.fetch = vi.fn().mockResolvedValueOnce(
      createMockStreamResponse(['Second response.'])
    );

    // Send second message
    fireEvent.change(input, { target: { value: 'Second message' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    // Wait for second response
    await waitFor(() => {
      const assistantMessages = screen.getAllByTestId('assistant-message');
      const lastMessage = assistantMessages[assistantMessages.length - 1];
      return lastMessage.textContent?.includes('Second response.');
    }, { timeout: 2000 });

    // Verify both messages and responses are in the document
    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
    
    // Check for responses in assistant messages
    const assistantMessages = screen.getAllByTestId('assistant-message');
    expect(assistantMessages.some(msg => msg.textContent?.includes('First response.'))).toBe(true);
    expect(assistantMessages.some(msg => msg.textContent?.includes('Second response.'))).toBe(true);

    // Verify the conversation history is passed in the second request
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/agents/${agentId}/chat`,
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Second message'),
      })
    );
  });

  it('should show loading state during streaming', async () => {
    // Create a promise that we can resolve manually to control the timing
    let resolveStream: (value: Response) => void;
    const streamPromise = new Promise<Response>(resolve => {
      resolveStream = resolve;
    });
    
    global.fetch = vi.fn().mockReturnValueOnce(streamPromise);

    render(<AgentChatWrapper agentId={agentId} initialMessages={initialMessages} />);

    // Send a message
    const input = screen.getByTestId('message-input');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    // Verify loading indicator is shown
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();

    // Resolve the stream
    act(() => {
      resolveStream(createMockStreamResponse(['Response after loading.']));
    });

    // Wait for the response
    await waitFor(() => {
      const assistantMessages = screen.getAllByTestId('assistant-message');
      const lastMessage = assistantMessages[assistantMessages.length - 1];
      return lastMessage.textContent?.includes('Response after loading.');
    }, { timeout: 2000 });

    // Wait for loading indicator to disappear
    await waitFor(() => {
      return !screen.queryByTestId('loading-indicator');
    }, { timeout: 2000 });
  });
}); 