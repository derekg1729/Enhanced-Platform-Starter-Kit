import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import AgentDetailsPage from '../../../app/app/(dashboard)/agents/[id]/page';
import { getAgentById } from '../../../lib/agent-db';
import { getServerSession } from 'next-auth';

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

// Mock the AgentApiConnectionManager component
vi.mock('../../../components/agent/AgentApiConnectionManager', () => {
  return {
    __esModule: true,
    default: ({ agentId }: { agentId: string }) => (
      <div data-testid="agent-api-connection-manager">
        API connections for agent: {agentId}
      </div>
    ),
  };
});

// Mock the auth and database functions
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('../../../lib/agent-db', () => ({
  getAgentById: vi.fn(),
}));

describe('Agent Chat Interface Integration', () => {
  const mockAgent = {
    id: 'test-agent-123',
    name: 'Test Agent',
    description: 'This is a test agent',
    systemPrompt: 'You are a helpful assistant',
    model: 'gpt-3.5-turbo',
    temperature: '0.7',
    maxTokens: 1000,
    userId: 'user-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock authentication
    (getServerSession as any).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    
    // Mock agent data
    (getAgentById as any).mockResolvedValue(mockAgent);
  });

  it('renders the chat interface on the agent details page', async () => {
    const { findByTestId } = render(await AgentDetailsPage({ params: { id: 'test-agent-123' } }));
    
    const chatInterface = await findByTestId('agent-chat-interface');
    expect(chatInterface).toBeInTheDocument();
    expect(chatInterface).toHaveTextContent('Chat interface for agent: test-agent-123');
  });

  it('has a back to agents link', async () => {
    const { findByText } = render(await AgentDetailsPage({ params: { id: 'test-agent-123' } }));
    
    const backLink = await findByText('Back to agents');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/agents');
  });

  it('displays the agent details header', async () => {
    const { findByText } = render(await AgentDetailsPage({ params: { id: 'test-agent-123' } }));
    
    const title = await findByText('Agent Details');
    expect(title).toBeInTheDocument();
  });
}); 