import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AgentsPageClient from '../../../app/app/(dashboard)/agents/AgentsPageClient';
import { Agent } from '../../../components/agent/AgentCard';

// Mock next/navigation
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock data for agents
const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Real API Agent 1',
    description: 'This is a test agent from the API',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
    imageUrl: '/agent1.png',
    status: 'active',
    type: 'hello-world',
  },
  {
    id: 'agent-2',
    name: 'Real API Agent 2',
    description: 'Another test agent from the API',
    createdAt: '2023-01-03T00:00:00.000Z',
    updatedAt: '2023-01-04T00:00:00.000Z',
    imageUrl: '/agent2.png',
    status: 'inactive',
    type: 'hello-world',
  },
];

describe('AgentsPageClient with Test Data', () => {
  it('displays agents when provided as initialAgents', async () => {
    render(
      <AgentsPageClient 
        initialAgents={mockAgents} 
        initialLoading={false} 
        testMode={true} 
      />
    );
    
    // Agents should be displayed immediately without loading state
    expect(screen.getByText('Real API Agent 1')).toBeInTheDocument();
    expect(screen.getByText('Real API Agent 2')).toBeInTheDocument();
  });

  it('shows loading state when initialLoading is true', () => {
    render(
      <AgentsPageClient 
        initialAgents={[]} 
        initialLoading={true} 
        testMode={true} 
      />
    );
    
    // Check loading state
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText('Loading agents...')).toBeInTheDocument();
  });

  it('shows error state when initialError is provided', () => {
    render(
      <AgentsPageClient 
        initialAgents={[]} 
        initialLoading={false} 
        initialError="Test error message" 
        testMode={true} 
      />
    );
    
    // Check if error message is displayed
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('shows empty state when no agents are provided', () => {
    render(
      <AgentsPageClient 
        initialAgents={[]} 
        initialLoading={false} 
        testMode={true} 
      />
    );
    
    // Check if empty state message is displayed
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No agents found')).toBeInTheDocument();
  });
}); 