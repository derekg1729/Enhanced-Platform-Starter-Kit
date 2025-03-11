import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AgentsPageClient from '../../../app/app/(dashboard)/agents/AgentsPageClient';
import { Agent } from '../../../components/agent/AgentCard';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock data for testing
const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'API Agent 1',
    description: 'This agent comes from the API',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrl: 'https://example.com/image1.png',
    status: 'active',
    type: 'chat',
  },
  {
    id: 'agent-2',
    name: 'API Agent 2',
    description: 'This is another agent from the API',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrl: 'https://example.com/image2.png',
    status: 'active',
    type: 'chat',
  },
];

describe('AgentsPage', () => {
  it('displays loading state initially', () => {
    render(<AgentsPageClient initialLoading={true} testMode={true} />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('displays agents after loading', () => {
    render(<AgentsPageClient initialLoading={false} initialAgents={mockAgents} testMode={true} />);
    expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    expect(screen.getByText('API Agent 1')).toBeInTheDocument();
    expect(screen.getByText('API Agent 2')).toBeInTheDocument();
  });

  it('displays empty state when no agents exist', () => {
    render(<AgentsPageClient initialLoading={false} initialAgents={[]} testMode={true} />);
    expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    expect(screen.getByText(/You don't have any agents yet/i)).toBeInTheDocument();
  });

  it('displays error message when there is an error', () => {
    render(<AgentsPageClient initialLoading={false} initialError="Failed to fetch agents" testMode={true} />);
    expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    expect(screen.getByText(/Failed to fetch agents/i)).toBeInTheDocument();
  });
}); 