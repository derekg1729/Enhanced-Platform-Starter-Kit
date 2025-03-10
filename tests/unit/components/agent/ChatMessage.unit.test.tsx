import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChatMessage from '../../../../components/agent/ChatMessage';
import { format } from 'date-fns';

describe('ChatMessage', () => {
  it('renders user messages correctly', () => {
    const message = {
      id: '1',
      content: 'Hello, this is a test message',
      role: 'user' as const,
      timestamp: new Date().toISOString(),
    };

    render(<ChatMessage message={message} showTimestamp />);

    expect(screen.getByTestId('user-message')).toBeInTheDocument();
    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
  });

  it('renders assistant messages correctly', () => {
    const message = {
      id: '2',
      content: 'Hello, I am the assistant',
      role: 'assistant' as const,
      timestamp: new Date().toISOString(),
    };

    render(<ChatMessage message={message} showTimestamp />);

    expect(screen.getByTestId('assistant-message')).toBeInTheDocument();
    expect(screen.getByText('Hello, I am the assistant')).toBeInTheDocument();
  });

  it('displays timestamp when showTimestamp is true', () => {
    const timestamp = new Date();
    const message = {
      id: '3',
      content: 'Message with timestamp',
      role: 'user' as const,
      timestamp: timestamp.toISOString(),
    };

    render(<ChatMessage message={message} showTimestamp />);

    const formattedTime = format(timestamp, 'h:mm a');
    expect(screen.getByText(formattedTime)).toBeInTheDocument();
  });

  it('does not display timestamp when showTimestamp is false', () => {
    const timestamp = new Date();
    const message = {
      id: '4',
      content: 'Message without timestamp',
      role: 'user' as const,
      timestamp: timestamp.toISOString(),
    };

    render(<ChatMessage message={message} showTimestamp={false} />);

    const formattedTime = format(timestamp, 'h:mm a');
    expect(screen.queryByText(formattedTime)).not.toBeInTheDocument();
  });

  it('renders markdown content correctly', () => {
    const message = {
      id: '5',
      content: 'This is **bold** and *italic* text',
      role: 'assistant' as const,
      timestamp: new Date().toISOString(),
    };

    render(<ChatMessage message={message} showTimestamp />);

    // Use a more flexible approach to find text that might be broken up by multiple elements
    expect(screen.getByText(/bold/i)).toBeInTheDocument();
    expect(screen.getByText(/italic/i)).toBeInTheDocument();
    
    // Check that the elements have the correct styling
    const boldElement = screen.getByText(/bold/i);
    expect(boldElement.tagName).toBe('STRONG');
    
    const italicElement = screen.getByText(/italic/i);
    expect(italicElement.tagName).toBe('EM');
  });

  it('renders code blocks correctly', () => {
    const message = {
      id: '6',
      content: '```javascript\nconst x = 1;\n```',
      role: 'assistant' as const,
      timestamp: new Date().toISOString(),
    };

    render(<ChatMessage message={message} showTimestamp />);

    expect(screen.getByTestId('code-block')).toBeInTheDocument();
    // Note: The syntax highlighter breaks up the text, so we can't test for the exact string
  });
}); 