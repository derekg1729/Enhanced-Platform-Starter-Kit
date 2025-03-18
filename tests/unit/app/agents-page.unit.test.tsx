import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AgentsPage from '@/app/app/(dashboard)/agents/page';

// Mock the Agents component
vi.mock('@/components/agents', () => ({
  default: ({ limit }: { limit?: number }) => (
    <div data-testid="agents-mock">
      <div data-testid="limit">{limit || 'no-limit'}</div>
    </div>
  ),
}));

// Mock the CreateAgentButton component
vi.mock('@/components/create-agent-button', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="create-agent-button">Create New Agent</button>
  ),
}));

// Mock the CreateAgentModal component
vi.mock('@/components/modal/create-agent', () => ({
  default: () => <div data-testid="create-agent-modal">Modal Content</div>,
}));

describe('Agents Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the agents page with correct title', async () => {
    const { container } = render(await AgentsPage());
    
    expect(screen.getByText('All Agents')).toBeInTheDocument();
    expect(container.querySelector('h1')).toHaveTextContent('All Agents');
  });

  it('renders the Agents component', async () => {
    render(await AgentsPage());
    
    expect(screen.getByTestId('agents-mock')).toBeInTheDocument();
  });

  it('renders the CreateAgentButton', async () => {
    render(await AgentsPage());
    
    expect(screen.getByTestId('create-agent-button')).toBeInTheDocument();
  });

  it('renders the API keys link', async () => {
    render(await AgentsPage());
    
    const apiKeysLink = screen.getByText('Manage API Keys');
    expect(apiKeysLink).toBeInTheDocument();
    expect(apiKeysLink.closest('a')).toHaveAttribute('href', '/api-keys');
  });

  it('has the correct page structure', async () => {
    const { container } = render(await AgentsPage());
    
    // Check for container div
    expect(container.querySelector('div')).toBeInTheDocument();
    
    // Check for h1 title
    expect(container.querySelector('h1')).toHaveTextContent('All Agents');
    
    // Check for agents list section
    expect(screen.getByTestId('agents-mock')).toBeInTheDocument();
    
    // Check for API keys link
    expect(screen.getByText('Manage API Keys')).toBeInTheDocument();
    expect(screen.getByText('Manage API Keys').closest('a')).toHaveAttribute('href', '/api-keys');
  });
}); 