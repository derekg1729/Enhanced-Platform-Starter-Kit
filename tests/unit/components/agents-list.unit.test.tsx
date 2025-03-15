import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AgentsList from '@/components/agents-list';
import { Agent } from '@/lib/schema';

// Mock the useRouter hook
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock the toast function
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AgentsList Component', () => {
  const mockAgents: Agent[] = [
    {
      id: '1',
      name: 'Test Agent 1',
      description: 'This is a test agent',
      model: 'gpt-4',
      userId: 'user1',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: '2',
      name: 'Test Agent 2',
      description: 'Another test agent',
      model: 'gpt-3.5-turbo',
      userId: 'user1',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
  ];

  it('renders loading state when loading is true', () => {
    render(<AgentsList agents={[]} loading={true} />);
    
    expect(screen.getByText('Loading agents...')).toBeInTheDocument();
  });

  it('renders empty state when no agents are available', () => {
    render(<AgentsList agents={[]} loading={false} />);
    
    expect(screen.getByText('No agents found')).toBeInTheDocument();
    expect(screen.getByText('Create your first agent to get started.')).toBeInTheDocument();
  });

  it('renders a list of agent cards when agents are available', () => {
    render(<AgentsList agents={mockAgents} loading={false} />);
    
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
    expect(screen.getByText('This is a test agent')).toBeInTheDocument();
    expect(screen.getByText('Test Agent 2')).toBeInTheDocument();
    expect(screen.getByText('Another test agent')).toBeInTheDocument();
  });

  it('renders a create agent button', () => {
    render(<AgentsList agents={mockAgents} loading={false} />);
    
    const createButton = screen.getByRole('button', { name: /create agent/i });
    expect(createButton).toBeInTheDocument();
  });

  it('displays the correct number of agents', () => {
    render(<AgentsList agents={mockAgents} loading={false} />);
    
    const agentCards = screen.getAllByTestId('agent-card');
    expect(agentCards).toHaveLength(2);
  });

  it('renders with the correct layout and styling', () => {
    render(<AgentsList agents={mockAgents} loading={false} />);
    
    const container = screen.getByTestId('agents-list-container');
    expect(container).toHaveClass('grid', 'gap-4');
  });
}); 