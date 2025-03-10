import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import AgentsPage from '../../../../app/app/(dashboard)/agents/page';

// Mock the AgentDashboard component
vi.mock('../../../../components/agent/AgentDashboard', () => ({
  default: ({ agents, isLoading }: { agents: any[]; isLoading: boolean }) => (
    <div data-testid="agent-dashboard">
      <div>Agents Count: {agents.length}</div>
      <div>Loading: {isLoading ? 'true' : 'false'}</div>
    </div>
  )
}));

describe('AgentsPage', () => {
  it('renders the AgentDashboard component', () => {
    render(<AgentsPage />);
    
    expect(screen.getByTestId('agent-dashboard')).toBeInTheDocument();
  });

  it('passes mock agents to the AgentDashboard', () => {
    render(<AgentsPage />);
    
    // The mock agents array in the page has 2 items
    expect(screen.getByText('Agents Count: 2')).toBeInTheDocument();
  });

  it('passes isLoading=false to the AgentDashboard', () => {
    render(<AgentsPage />);
    
    expect(screen.getByText('Loading: false')).toBeInTheDocument();
  });
}); 