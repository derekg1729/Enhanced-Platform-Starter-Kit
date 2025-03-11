import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import AgentDetailsPage from '../../../app/app/(dashboard)/agents/[id]/page';

// Mock the next/link component
vi.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ href, children }: { href: string; children: React.ReactNode }) => (
      <a href={href}>{children}</a>
    ),
  };
});

// Mock the AgentChatWrapper component
vi.mock('../../../components/agent/AgentChatWrapper', () => {
  return {
    __esModule: true,
    default: ({ agentId }: { agentId: string }) => (
      <div data-testid="agent-chat-interface">
        Chat interface for agent: {agentId}
      </div>
    ),
  };
});

describe('Agent Chat Interface Integration', () => {
  it('renders the chat interface on the agent details page', () => {
    render(<AgentDetailsPage params={{ id: 'test-agent-123' }} />);
    
    expect(screen.getByTestId('agent-chat-interface')).toBeInTheDocument();
    expect(screen.getByText('Chat interface for agent: test-agent-123')).toBeInTheDocument();
  });

  it('has a back to agents link', () => {
    render(<AgentDetailsPage params={{ id: 'test-agent-123' }} />);
    
    const backLink = screen.getByText('Back to agents');
    expect(backLink).toBeInTheDocument();
    expect(backLink.getAttribute('href')).toBe('/agents');
  });

  it('displays the agent details header', () => {
    render(<AgentDetailsPage params={{ id: 'test-agent-123' }} />);
    
    expect(screen.getByText('Agent Details')).toBeInTheDocument();
  });
}); 