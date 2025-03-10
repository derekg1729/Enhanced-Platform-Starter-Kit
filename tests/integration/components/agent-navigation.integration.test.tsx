import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AgentDetailsPage from '@/app/app/(dashboard)/agents/[id]/page';
import CreateAgentPage from '@/app/app/(dashboard)/agents/new/page';

describe('Agent Navigation', () => {
  it('should have correct "Back to agents" link in agent details page', () => {
    render(<AgentDetailsPage params={{ id: 'test-agent-123' }} />);
    
    const backLink = screen.getByText('Back to agents');
    expect(backLink).toBeInTheDocument();
    
    // Check that the link points to the correct URL
    const linkElement = backLink.closest('a');
    expect(linkElement).toHaveAttribute('href', '/agents');
  });
  
  it('should have correct "Back to agents" link in create agent page', () => {
    render(<CreateAgentPage />);
    
    const backLink = screen.getByText('Back to agents');
    expect(backLink).toBeInTheDocument();
    
    // Check that the link points to the correct URL
    const linkElement = backLink.closest('a');
    expect(linkElement).toHaveAttribute('href', '/agents');
  });
  
  it('should have correct "Cancel" button link in create agent page', () => {
    render(<CreateAgentPage />);
    
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeInTheDocument();
    
    // Check that the button's link points to the correct URL
    const linkElement = cancelButton.closest('a');
    expect(linkElement).toHaveAttribute('href', '/agents');
  });
}); 