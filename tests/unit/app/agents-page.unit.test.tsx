import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AgentsPage from '@/app/app/(dashboard)/agents/page';
import { Agent } from '@/lib/schema';

// Mock the AgentsList component
vi.mock('@/components/agents-list', () => ({
  default: ({ agents, loading }: { agents: Agent[], loading: boolean }) => (
    <div data-testid="agents-list-mock">
      <div data-testid="agents-count">{agents.length}</div>
      <div data-testid="loading-state">{loading.toString()}</div>
    </div>
  ),
}));

// Mock the getAgents function
vi.mock('@/lib/actions', () => ({
  getAgents: vi.fn(),
}));

// Mock the auth session
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(() => Promise.resolve({
    user: { id: 'user-123' }
  })),
}));

import { getAgents } from '@/lib/actions';

describe('Agents Page', () => {
  const mockAgents: Agent[] = [
    {
      id: '1',
      name: 'Test Agent 1',
      description: 'This is a test agent',
      model: 'gpt-4',
      userId: 'user-123',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: '2',
      name: 'Test Agent 2',
      description: 'Another test agent',
      model: 'gpt-3.5-turbo',
      userId: 'user-123',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the agents page with correct title', async () => {
    vi.mocked(getAgents).mockResolvedValue(mockAgents);
    
    const { container } = render(await AgentsPage());
    
    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(container.querySelector('h1')).toHaveTextContent('Agents');
  });

  it('passes agents to the AgentsList component', async () => {
    vi.mocked(getAgents).mockResolvedValue(mockAgents);
    
    render(await AgentsPage());
    
    const agentCount = screen.getByTestId('agents-count');
    expect(agentCount).toHaveTextContent('2');
  });

  it('calls getAgents with the user ID from the session', async () => {
    vi.mocked(getAgents).mockResolvedValue(mockAgents);
    
    render(await AgentsPage());
    
    expect(getAgents).toHaveBeenCalledWith('user-123');
  });

  it('handles loading state correctly', async () => {
    // Mock getAgents to return a promise that doesn't resolve immediately
    vi.mocked(getAgents).mockImplementation(() => new Promise((resolve) => {
      setTimeout(() => resolve(mockAgents), 100);
    }));
    
    // Since we're testing a server component, we need to render the loading state
    // This is a simplified test since we can't easily test suspense in unit tests
    const { container } = render(await AgentsPage());
    
    // The loading state should be false after the component renders
    const loadingState = screen.getByTestId('loading-state');
    expect(loadingState).toHaveTextContent('false');
  });

  it('handles empty agents array', async () => {
    vi.mocked(getAgents).mockResolvedValue([]);
    
    render(await AgentsPage());
    
    const agentCount = screen.getByTestId('agents-count');
    expect(agentCount).toHaveTextContent('0');
  });

  it('has the correct page structure', async () => {
    vi.mocked(getAgents).mockResolvedValue(mockAgents);
    
    const { container } = render(await AgentsPage());
    
    // Check for main container
    expect(container.querySelector('main')).toBeInTheDocument();
    
    // Check for header section
    expect(container.querySelector('header')).toBeInTheDocument();
    
    // Check for agents list section
    expect(screen.getByTestId('agents-list-mock')).toBeInTheDocument();
  });
}); 