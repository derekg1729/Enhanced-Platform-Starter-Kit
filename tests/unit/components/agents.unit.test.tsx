import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import Agents from '@/components/agents';
import { SelectAgent } from '@/lib/schema';
import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';

// Mock the AgentCard component
vi.mock('@/components/agent-card', () => ({
  default: ({ data }: { data: SelectAgent }) => (
    <div data-testid="agent-card">
      <div>{data.name}</div>
      <div>{data.description}</div>
      <div>{data.model}</div>
    </div>
  ),
}));

// Mock the getSession function
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn().mockResolvedValue({
    user: { id: 'user-123', name: 'Test User', email: 'test@example.com' }
  }),
}));

// Mock the db query
vi.mock('@/lib/db', () => ({
  default: {
    query: {
      agents: {
        findMany: vi.fn(),
      },
    },
  },
}));

// Mock the redirect function
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock the Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height }: any) => (
    <div data-testid="next-image">
      {/* Mock Image component to avoid ESLint warning */}
      <span>{src}</span>
      <span>{alt}</span>
      <span>{width}</span>
      <span>{height}</span>
    </div>
  ),
}));

describe('Agents Component', () => {
  it('renders a list of agent cards when agents are available', async () => {
    const mockAgents = [
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
    
    // Mock the findMany function to return the mock agents
    vi.mocked(db.query.agents.findMany).mockResolvedValue(mockAgents);
    
    const component = await Agents({});
    render(component);
    
    // Check if agent cards are rendered
    const agentCards = screen.getAllByTestId('agent-card');
    expect(agentCards).toHaveLength(2);
    
    // Check if agent names are displayed
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
    expect(screen.getByText('Test Agent 2')).toBeInTheDocument();
    
    // Check if agent descriptions are displayed
    expect(screen.getByText('This is a test agent')).toBeInTheDocument();
    expect(screen.getByText('Another test agent')).toBeInTheDocument();
  });

  it('renders the empty state when no agents are available', async () => {
    // Mock the findMany function to return an empty array
    vi.mocked(db.query.agents.findMany).mockResolvedValue([]);
    
    const component = await Agents({});
    render(component);
    
    // Check if the empty state is rendered
    expect(screen.getByText('No Agents Yet')).toBeInTheDocument();
    expect(screen.getByText('You do not have any agents yet. Create one to get started.')).toBeInTheDocument();
  });

  it('respects the limit parameter', async () => {
    const mockAgents = [
      {
        id: '1',
        name: 'Test Agent 1',
        description: 'This is a test agent',
        model: 'gpt-4',
        userId: 'user-123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
    ];
    
    // Mock the findMany function to return the mock agents
    vi.mocked(db.query.agents.findMany).mockResolvedValue(mockAgents);
    
    // Call the component with a limit
    await Agents({ limit: 1 });
    
    // Verify that the limit was passed to the query
    expect(db.query.agents.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 1,
      }),
    );
  });

  it('redirects to login when no session is available', async () => {
    // Mock getSession to return null
    vi.mocked(getSession).mockResolvedValueOnce(null);
    
    await Agents({});
    
    // Verify that redirect was called with the login path
    expect(redirect).toHaveBeenCalledWith('/login');
  });
}); 