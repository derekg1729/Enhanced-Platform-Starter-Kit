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

  it('has a disabled create button', () => {
    render(<CreateAgentPage />);
    
    const createButton = screen.getByText('Create Agent');
    expect(createButton.closest('button')).toBeDisabled();
  });

  it('has a cancel button', () => {
    render(<CreateAgentPage />);
    
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton.closest('a')).toHaveAttribute('href', '/agents');
  });

  it('displays a placeholder message about the form implementation', () => {
    render(<CreateAgentPage />);
    
    expect(screen.getByText(/This page will contain a form for creating a new agent/)).toBeInTheDocument();
    expect(screen.getByText(/TASK-HW000B/)).toBeInTheDocument();
  });
}); 