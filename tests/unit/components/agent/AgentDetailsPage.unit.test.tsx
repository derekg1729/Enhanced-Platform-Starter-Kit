import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AgentDetailsPage from '../../../../app/app/(dashboard)/agents/[id]/page';
import { getAgentById, updateAgent } from '../../../../lib/agent-db';
import { getServerSession } from 'next-auth';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

// Mock next/link
vi.mock('next/link', () => {
  return {
    default: ({ children, href }: { children: React.ReactNode; href: string }) => {
      return <a href={href}>{children}</a>;
    },
  };
});

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock agent-db
vi.mock('../../../../lib/agent-db', () => ({
  getAgentById: vi.fn(),
  updateAgent: vi.fn(),
}));

// Mock AgentChatWrapper
vi.mock('../../../../components/agent/AgentChatWrapper', () => ({
  default: () => <div data-testid="agent-chat-wrapper">Agent Chat Wrapper</div>,
}));

// Mock AgentApiConnectionManager
vi.mock('../../../../components/agent/AgentApiConnectionManager', () => ({
  default: () => <div data-testid="agent-api-connection-manager">API Connection Manager</div>,
}));

// Mock ModelSelectorWrapper
vi.mock('../../../../components/agent/ModelSelectorWrapper', () => ({
  default: ({ agentId, currentModel }: { agentId: string; currentModel: string }) => (
    <div data-testid="model-selector">
      <select 
        data-testid="model-select" 
        defaultValue={currentModel}
        disabled
      >
        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        <option value="gpt-4">GPT-4</option>
      </select>
      <button>Save Model</button>
    </div>
  ),
}));

// Mock fetch
const mockFetchResponse = {
  ok: true,
  json: () => Promise.resolve({ success: true }),
};

describe('AgentDetailsPage', () => {
  const mockAgent = {
    id: 'test-agent-123',
    name: 'Test Agent',
    description: 'This is a test agent',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: 'You are a helpful assistant',
    apiConnectionId: 'api-connection-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock session
    (getServerSession as any).mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
      },
    });
    
    // Mock getAgentById
    (getAgentById as any).mockResolvedValue(mockAgent);
    
    // Mock fetch
    global.fetch = vi.fn().mockImplementation(() => Promise.resolve(mockFetchResponse));
  });

  it('displays the agent ID', async () => {
    render(await AgentDetailsPage({ params: { id: 'test-agent-123' } }));
    expect(screen.getByText('test-agent-123')).toBeInTheDocument();
  });

  it('has a link back to the agents list', async () => {
    render(await AgentDetailsPage({ params: { id: 'test-agent-123' } }));
    const backLink = screen.getByText('Back to agents');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/agents');
  });

  it('displays the page title', async () => {
    render(await AgentDetailsPage({ params: { id: 'test-agent-123' } }));
    expect(screen.getByText('Agent Details')).toBeInTheDocument();
  });

  it('displays the actual agent name from the database', async () => {
    render(await AgentDetailsPage({ params: { id: 'test-agent-123' } }));
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
  });

  it('displays the actual agent description from the database', async () => {
    render(await AgentDetailsPage({ params: { id: 'test-agent-123' } }));
    expect(screen.getByText('This is a test agent')).toBeInTheDocument();
  });

  it('displays the actual agent status from the database', async () => {
    render(await AgentDetailsPage({ params: { id: 'test-agent-123' } }));
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('calls getAgentById with the correct parameters', async () => {
    await AgentDetailsPage({ params: { id: 'test-agent-123' } });
    expect(getAgentById).toHaveBeenCalledWith('test-agent-123', 'user-123');
  });

  it('renders the ModelSelector component with the current model', async () => {
    render(await AgentDetailsPage({ params: { id: 'test-agent-123' } }));
    const modelSelector = screen.getByTestId('model-selector');
    expect(modelSelector).toBeInTheDocument();
  });

  it('allows updating the agent model', async () => {
    render(await AgentDetailsPage({ params: { id: 'test-agent-123' } }));
    
    // Since we're now using a client component wrapper, we can't directly test
    // the model update functionality in this server component test.
    // The actual update functionality is tested in the ModelSelectorWrapper tests.
    
    // Instead, we'll just verify that the ModelSelectorWrapper is rendered with the correct props
    const modelSelector = screen.getByTestId('model-selector');
    expect(modelSelector).toBeInTheDocument();
    
    // Verify the current model is passed correctly
    const modelSelect = screen.getByTestId('model-select');
    expect(modelSelect).toHaveValue('gpt-3.5-turbo');
  });
}); 