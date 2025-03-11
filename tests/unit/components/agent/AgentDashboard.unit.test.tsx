import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import AgentDashboard from '../../../../components/agent/AgentDashboard';
import { Agent } from '../../../../components/agent/AgentCard';

// Mock the router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock the Link component
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} data-testid="link">{children}</a>
  ),
}));

// Mock the fetch function
global.fetch = vi.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as any;

// Mock the AgentCard component
vi.mock('../../../../components/agent/AgentCard', () => ({
  default: ({ agent }: { agent: any }) => (
    <div data-testid={`agent-card-${agent.id}`}>
      {agent.name}
    </div>
  ),
}));

describe('AgentDashboard', () => {
  const mockAgents: Agent[] = [
    {
      id: '1',
      name: 'Test Agent',
      description: 'Test Description',
      createdAt: new Date(),
      status: 'active',
    },
  ];

  it('renders the dashboard title', () => {
    render(<AgentDashboard agents={mockAgents} isLoading={false} />);
    expect(screen.getByText('Your Agents')).toBeInTheDocument();
  });

  it('renders the create agent button', () => {
    render(<AgentDashboard agents={mockAgents} isLoading={false} />);
    expect(screen.getByText('Create Agent')).toBeInTheDocument();
  });

  it('links to the correct agent creation page', () => {
    render(<AgentDashboard agents={mockAgents} isLoading={false} />);
    const createButton = screen.getByText('Create Agent').closest('a');
    expect(createButton).toHaveAttribute('href', '/agents/new');
  });

  it('links to the correct agent creation page in empty state', () => {
    render(<AgentDashboard agents={[]} isLoading={false} />);
    const createButton = screen.getByText('Create your first agent').closest('a');
    expect(createButton).toHaveAttribute('href', '/agents/new');
  });

  it('renders agent cards for each agent', () => {
    render(<AgentDashboard agents={mockAgents} isLoading={false} />);
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
  });

  it('displays a loading state when isLoading is true', () => {
    render(<AgentDashboard agents={[]} isLoading={true} />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('displays an empty state when there are no agents', () => {
    render(<AgentDashboard agents={[]} isLoading={false} />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText("You don't have any agents yet.")).toBeInTheDocument();
  });
}); 