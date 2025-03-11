import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import CreateAgentPage from '../../../../app/app/(dashboard)/agents/new/page';

// Mock the Link component
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  )
}));

// Mock the AgentCreationForm component
vi.mock('../../../../components/agent/AgentCreationForm', () => ({
  default: () => <div data-testid="agent-creation-form">Agent Creation Form</div>
}));

describe('CreateAgentPage', () => {
  it('displays the page title', () => {
    render(<CreateAgentPage />);
    
    expect(screen.getByText('Create New Agent')).toBeInTheDocument();
  });

  it('has a link back to the agents list', () => {
    render(<CreateAgentPage />);
    
    const backLink = screen.getByText('Back to agents');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/agents');
  });

  it('renders the AgentCreationForm component', () => {
    render(<CreateAgentPage />);
    
    expect(screen.getByTestId('agent-creation-form')).toBeInTheDocument();
  });
}); 