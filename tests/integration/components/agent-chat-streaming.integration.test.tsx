import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import AgentChatWrapper from '@/components/agent/AgentChatWrapper';
import { Message } from '@/components/agent/AgentChatInterface';
import { Wrapper } from '@/tests/__helpers__/test-utils';

// Define the expected request body type
interface ChatRequestBody {
  message: string;
  conversationId?: string;
}

// Create a mock server to intercept API requests
const server = setupServer(
  // Mock the chat API endpoint
  http.post('/api/agents/:agentId/chat', async ({ params, request }) => {
    const { agentId } = params;
    const body = await request.json() as ChatRequestBody;
    
    // Create a stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Send chunks of the response
        const chunks = ['Hello', ', ', 'this ', 'is ', 'a ', 'streaming ', 'response ', 'for ', `"${body.message}"`, '.'];
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
          // Add a small delay between chunks to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        controller.close();
      }
    });
    
    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
      },
    });
  }),
  
  // Mock the API connections endpoint
  http.get('/api/api-connections', () => {
    return HttpResponse.json([
      {
        id: 'api-conn-1',
        name: 'OpenAI API',
        service: 'openai',
        userId: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]);
  }),
  
  // Mock the agent API connections endpoint
  http.get('/api/agents/:agentId/api-connections', () => {
    return HttpResponse.json([
      {
        id: 'api-conn-1',
        name: 'OpenAI API',
        service: 'openai',
        userId: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]);
  })
);

describe('Agent Chat Streaming Integration', () => {
  const agentId = 'test-agent-123';
  const initialMessages: Message[] = [
    {
      id: '1',
      content: 'Hello! I am your assistant. How can I help you today?',
      role: 'assistant',
      timestamp: new Date().toISOString()
    }
  ];

  // Start the MSW server before tests
  beforeAll(() => server.listen());
  
  // Reset handlers after each test
  afterEach(() => server.resetHandlers());
  
  // Close the server after all tests
  afterAll(() => server.close());

  it('should stream responses from the API', async () => {
    render(
      <Wrapper>
        <AgentChatWrapper agentId={agentId} initialMessages={initialMessages} />
      </Wrapper>
    );

    // Send a message
    const input = screen.getByTestId('message-input');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    // Verify user message is displayed
    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Verify loading indicator is shown
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();

    // Wait for the streaming response to start
    await waitFor(() => {
      const assistantMessages = screen.getAllByTestId('assistant-message');
      const lastMessage = assistantMessages[assistantMessages.length - 1];
      return lastMessage.textContent?.includes('Hello');
    }, { timeout: 1000 });

    // Wait for the complete streaming response
    await waitFor(() => {
      const assistantMessages = screen.getAllByTestId('assistant-message');
      const lastMessage = assistantMessages[assistantMessages.length - 1];
      return lastMessage.textContent?.includes('streaming response for') && 
             lastMessage.textContent?.includes('Test message');
    }, { timeout: 2000 });

    // Verify loading indicator is no longer shown
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    // Override the handler for this test to return an error
    server.use(
      http.post('/api/agents/:agentId/chat', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(
      <Wrapper>
        <AgentChatWrapper agentId={agentId} initialMessages={initialMessages} />
      </Wrapper>
    );

    // Send a message
    const input = screen.getByTestId('message-input');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
  });

  it('should maintain conversation context across messages', async () => {
    // Create a mock handler that checks for conversation ID
    let conversationId: string | undefined;
    
    server.use(
      http.post('/api/agents/:agentId/chat', async ({ request }) => {
        const body = await request.json() as ChatRequestBody;
        
        // Store the conversation ID from the first request
        if (!conversationId) {
          conversationId = body.conversationId;
        }
        
        // Create a stream response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            // Send a response that includes the conversation ID status
            const response = body.conversationId === conversationId
              ? 'Conversation context maintained.'
              : 'Conversation context lost!';
              
            controller.enqueue(encoder.encode(response));
            controller.close();
          }
        });
        
        return new HttpResponse(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
          },
        });
      })
    );

    render(
      <Wrapper>
        <AgentChatWrapper agentId={agentId} initialMessages={initialMessages} />
      </Wrapper>
    );

    // Send first message
    const input = screen.getByTestId('message-input');
    fireEvent.change(input, { target: { value: 'First message' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    // Wait for first response
    await waitFor(() => {
      const assistantMessages = screen.getAllByTestId('assistant-message');
      const lastMessage = assistantMessages[assistantMessages.length - 1];
      return lastMessage.textContent?.includes('Conversation context maintained');
    });

    // Send second message
    fireEvent.change(input, { target: { value: 'Second message' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    // Wait for second response - should still maintain context
    await waitFor(() => {
      const assistantMessages = screen.getAllByTestId('assistant-message');
      // Count messages that include the text
      const contextMaintainedMessages = assistantMessages.filter(
        msg => msg.textContent?.includes('Conversation context maintained')
      );
      return contextMaintainedMessages.length >= 2;
    });
  });
}); 