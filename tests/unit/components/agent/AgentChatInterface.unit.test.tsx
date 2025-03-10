import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AgentChatInterface, { Message } from '../../../../components/agent/AgentChatInterface';

describe('AgentChatInterface', () => {
  const mockSendMessage = vi.fn();

  it('renders the chat interface with empty message list', () => {
    render(
      <AgentChatInterface
        agentId="test-agent-123"
        messages={[]}
        onSendMessage={mockSendMessage}
      />
    );

    expect(screen.getByTestId('message-list')).toBeInTheDocument();
    expect(screen.getByText('No messages yet. Start a conversation with your agent.')).toBeInTheDocument();
  });

  it('displays messages in the message list', () => {
    const messages: Message[] = [
      {
        id: '1',
        content: 'Hello, how can I help?',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        content: 'I need information about your services',
        role: 'user',
        timestamp: new Date().toISOString(),
      },
    ];

    render(
      <AgentChatInterface
        agentId="test-agent-123"
        messages={messages}
        onSendMessage={mockSendMessage}
      />
    );

    expect(screen.getByTestId('assistant-message')).toBeInTheDocument();
    expect(screen.getByTestId('user-message')).toBeInTheDocument();
    expect(screen.getByText('Hello, how can I help?')).toBeInTheDocument();
    expect(screen.getByText('I need information about your services')).toBeInTheDocument();
  });

  it('sends a new message and clears input', () => {
    render(
      <AgentChatInterface
        agentId="test-agent-123"
        messages={[]}
        onSendMessage={mockSendMessage}
      />
    );

    const input = screen.getByTestId('message-input');
    fireEvent.change(input, { target: { value: 'Hello agent' } });
    fireEvent.click(screen.getByRole('button'));

    expect(mockSendMessage).toHaveBeenCalledWith('Hello agent');
    expect(input).toHaveValue('');
  });

  it('disables send button when input is empty', () => {
    render(
      <AgentChatInterface
        agentId="test-agent-123"
        messages={[]}
        onSendMessage={mockSendMessage}
      />
    );

    expect(screen.getByRole('button')).toBeDisabled();

    const input = screen.getByTestId('message-input');
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(screen.getByRole('button')).not.toBeDisabled();

    fireEvent.change(input, { target: { value: '' } });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading indicator when waiting for response', () => {
    render(
      <AgentChatInterface
        agentId="test-agent-123"
        messages={[]}
        isLoading={true}
        onSendMessage={mockSendMessage}
      />
    );

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('displays error message when message sending fails', () => {
    render(
      <AgentChatInterface
        agentId="test-agent-123"
        messages={[]}
        error="Failed to send message. Please try again."
        onSendMessage={mockSendMessage}
      />
    );

    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Failed to send message. Please try again.')).toBeInTheDocument();
  });

  it('allows sending message with Enter key', () => {
    render(
      <AgentChatInterface
        agentId="test-agent-123"
        messages={[]}
        onSendMessage={mockSendMessage}
      />
    );

    const input = screen.getByTestId('message-input');
    fireEvent.change(input, { target: { value: 'Hello with Enter' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockSendMessage).toHaveBeenCalledWith('Hello with Enter');
    expect(input).toHaveValue('');
  });
}); 