import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import NewAgentPage from '@/app/app/(dashboard)/agents/new/page';

// Mock the AgentForm component
vi.mock('@/components/agent-form', () => ({
  default: ({ title, description }: { title: string, description: string }) => (
    <div data-testid="agent-form-mock">
      <div data-testid="form-title">{title}</div>
      <div data-testid="form-description">{description}</div>
    </div>
  ),
}));

describe('New Agent Page', () => {
  it('renders the page with correct title', () => {
    render(<NewAgentPage />);
    
    // Use a more specific selector to avoid the multiple elements issue
    const heading = screen.getByRole('heading', { name: 'Create New Agent' });
    expect(heading).toBeInTheDocument();
    expect(screen.getByTestId('form-title')).toHaveTextContent('Create New Agent');
  });

  it('renders the AgentForm component with correct props', () => {
    render(<NewAgentPage />);
    
    expect(screen.getByTestId('agent-form-mock')).toBeInTheDocument();
    expect(screen.getByTestId('form-description')).toHaveTextContent('Configure your new AI agent with a name, description, and model.');
  });

  it('has the correct page structure', () => {
    const { container } = render(<NewAgentPage />);
    
    // Check for main container
    expect(container.querySelector('main')).toBeInTheDocument();
    
    // Check for header section
    expect(container.querySelector('header')).toBeInTheDocument();
    
    // Check for h1 title
    expect(container.querySelector('h1')).toHaveTextContent('Create New Agent');
    
    // Check for back button
    expect(screen.getByText('Back to Agents')).toBeInTheDocument();
    expect(screen.getByText('Back to Agents').closest('a')).toHaveAttribute('href', '/agents');
  });
}); 