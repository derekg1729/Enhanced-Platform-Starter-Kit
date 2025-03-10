import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import AgentDetailsPage from '../../../../app/app/(dashboard)/agents/[id]/page';

// Mock the Link component
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  )
}));

describe('AgentDetailsPage', () => {
  it('displays the agent ID', () => {
    render(<AgentDetailsPage params={{ id: 'test-agent-123' }} />);
    
    // Use a more specific selector to avoid multiple matches
    const agentIdElement = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'p' && 
             element?.className.includes('font-mono') && 
             content.includes('test-agent-123');
    });
    expect(agentIdElement).toBeInTheDocument();
  });

  it('has a link back to the agents list', () => {
    render(<AgentDetailsPage params={{ id: 'test-agent-123' }} />);
    
    // Update to match the actual text in the component
    const backLink = screen.getByText('Back to agents');
    expect(backLink).toBeInTheDocument();
    // Update the expected href to match the actual implementation
    expect(backLink.closest('a')).toHaveAttribute('href', '/agents');
  });

  it('displays the page title', () => {
    render(<AgentDetailsPage params={{ id: 'test-agent-123' }} />);
    
    expect(screen.getByText('Agent Details')).toBeInTheDocument();
  });
}); 