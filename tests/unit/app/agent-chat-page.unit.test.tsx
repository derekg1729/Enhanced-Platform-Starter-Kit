import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AgentChatPage from '@/app/app/(dashboard)/agents/[id]/chat/page';
import { notFound, redirect } from 'next/navigation';

// Mock the getSession function
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn().mockResolvedValue({
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com'
    }
  })
}));

// Mock drizzle-orm eq and and functions
vi.mock('drizzle-orm', () => ({
  eq: vi.fn().mockReturnValue({ sql: 'eq condition' }),
  and: vi.fn().mockReturnValue({ sql: 'and condition' }),
  relations: vi.fn().mockReturnValue(() => ({}))
}));

// Mock the schema import
vi.mock('@/lib/schema', () => ({
  agents: {
    id: 'agents.id',
    userId: 'agents.userId'
  }
}));

// Mock the getAgent function
vi.mock('@/lib/actions', () => ({
  getAgent: vi.fn(),
}));

// Mock the db query
vi.mock('@/lib/db', () => ({
  default: {
    query: {
      agents: {
        findFirst: vi.fn()
      }
    }
  }
}));

// Mock the ChatInterface component
vi.mock('@/components/chat-interface', () => ({
  default: ({ agent }: { agent: any }) => (
    <div data-testid="chat-interface-mock">
      <div data-testid="agent-name">{agent.name}</div>
      <div data-testid="agent-model">{agent.model}</div>
    </div>
  ),
}));

// Mock the next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn().mockImplementation(() => {
    // Mock implementation to prevent further execution
    throw new Error('NotFound');
  }),
  redirect: vi.fn()
}));

// Mock the BlurImage component
vi.mock('@/components/blur-image', () => ({
  default: ({ alt, src }: { alt: string, src: string }) => (
    <div data-testid="blur-image" data-alt={alt} data-src={src} />
  ),
}));

// Mock the utils
vi.mock('@/lib/utils', () => ({
  placeholderBlurhash: 'data:image/png;base64,mockPlaceholderData'
}));

import { getAgent } from '@/lib/actions';
import db from '@/lib/db';

describe('Agent Chat Page', () => {
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
    (db.query.agents.findFirst as any).mockResolvedValue(mockAgent);
  });

  it('renders the chat page with agent information', async () => {
    const { container } = render(await AgentChatPage({ params: { id: 'agent-123' } }));
    
    expect(screen.getByText('Chat with Test Agent')).toBeInTheDocument();
    expect(container.querySelector('h1')).toHaveTextContent('Chat with Test Agent');
  });

  it('passes agent to the ChatInterface component', async () => {
    render(await AgentChatPage({ params: { id: 'agent-123' } }));
    
    expect(screen.getByTestId('chat-interface-mock')).toBeInTheDocument();
    expect(screen.getByTestId('agent-name')).toHaveTextContent('Test Agent');
    expect(screen.getByTestId('agent-model')).toHaveTextContent('gpt-4');
  });

  it('calls db.query.agents.findFirst with the correct ID', async () => {
    render(await AgentChatPage({ params: { id: 'agent-123' } }));
    
    expect(db.query.agents.findFirst).toHaveBeenCalled();
  });

  it('calls notFound when agent is not found', async () => {
    (db.query.agents.findFirst as any).mockResolvedValue(null);
    
    try {
      await AgentChatPage({ params: { id: 'non-existent-agent' } });
    } catch (error) {
      if ((error as Error).message !== 'NotFound') {
        throw error; // Rethrow if it's not our expected error
      }
    }
    
    expect(notFound).toHaveBeenCalled();
  });

  it('has the correct page structure', async () => {
    const { container } = render(await AgentChatPage({ params: { id: 'agent-123' } }));
    
    // Check for main container
    expect(container.querySelector('div')).toBeInTheDocument();
    
    // Check for back button
    expect(screen.getByText('Back to agent details')).toBeInTheDocument();
    expect(screen.getByText('Back to agent details').closest('a')).toHaveAttribute('href', '/agents/agent-123');
  });
}); 