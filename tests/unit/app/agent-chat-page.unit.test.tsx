import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AgentChatPage from '@/app/app/(dashboard)/agent/[id]/chat/page';
import { notFound } from 'next/navigation';

// Mock the getAgent function
vi.mock('@/lib/actions', () => ({
  getAgent: vi.fn(),
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
  notFound: vi.fn(),
}));

import { getAgent } from '@/lib/actions';

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
  });

  it('renders the chat page with agent information', async () => {
    vi.mocked(getAgent).mockResolvedValue(mockAgent);
    
    const { container } = render(await AgentChatPage({ params: { id: 'agent-123' } }));
    
    expect(screen.getByText('Chat with Test Agent')).toBeInTheDocument();
    expect(container.querySelector('h1')).toHaveTextContent('Chat with Test Agent');
  });

  it('passes agent to the ChatInterface component', async () => {
    vi.mocked(getAgent).mockResolvedValue(mockAgent);
    
    render(await AgentChatPage({ params: { id: 'agent-123' } }));
    
    expect(screen.getByTestId('chat-interface-mock')).toBeInTheDocument();
    expect(screen.getByTestId('agent-name')).toHaveTextContent('Test Agent');
    expect(screen.getByTestId('agent-model')).toHaveTextContent('gpt-4');
  });

  it('calls getAgent with the correct ID', async () => {
    vi.mocked(getAgent).mockResolvedValue(mockAgent);
    
    render(await AgentChatPage({ params: { id: 'agent-123' } }));
    
    expect(getAgent).toHaveBeenCalledWith('agent-123');
  });

  it('calls notFound when agent is not found', async () => {
    vi.mocked(getAgent).mockResolvedValue(null);
    
    await AgentChatPage({ params: { id: 'non-existent-agent' } });
    
    expect(notFound).toHaveBeenCalled();
  });

  it('has the correct page structure', async () => {
    vi.mocked(getAgent).mockResolvedValue(mockAgent);
    
    const { container } = render(await AgentChatPage({ params: { id: 'agent-123' } }));
    
    // Check for main container
    expect(container.querySelector('main')).toBeInTheDocument();
    
    // Check for header section
    expect(container.querySelector('header')).toBeInTheDocument();
    
    // Check for back button
    expect(screen.getByText('Back to Agents')).toBeInTheDocument();
    expect(screen.getByText('Back to Agents').closest('a')).toHaveAttribute('href', '/app/agents');
  });
}); 