import React from 'react';
import { render } from '@testing-library/react';
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

// Mock the AgentChatWrapper component to test the actual boundary
vi.mock('../../../components/agent/AgentChatWrapper', () => {
  // Create a wrapper that validates props
  return {
    __esModule: true,
    default: (props: any) => {
      // Check if onSendMessage is a function
      if (typeof props.onSendMessage === 'function') {
        throw new Error('Event handlers cannot be passed to Client Component props.');
      }
      
      // If we get here, render a placeholder
      return <div>Mock AgentChatWrapper</div>;
    },
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

describe('Server/Client Component Boundary', () => {
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

  it('should not pass function props directly from server to client components', async () => {
    // This test is now checking that we don't pass function props from server to client
    // Since our implementation doesn't do this, we expect it to render without error
    const result = await AgentDetailsPage({ params: { id: 'test-agent-123' } });
    expect(() => {
      render(result);
    }).not.toThrow('Event handlers cannot be passed to Client Component props.');
  });
}); 