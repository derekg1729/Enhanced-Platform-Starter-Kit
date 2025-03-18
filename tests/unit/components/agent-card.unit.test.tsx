import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import AgentCard from '@/components/agent-card';

// Mock the BlurImage component
vi.mock('@/components/blur-image', () => ({
  default: ({ alt, src }: { alt: string, src: string }) => (
    <div data-testid="blur-image" data-alt={alt} data-src={src} />
  ),
}));

// Mock Next Link
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string, children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('AgentCard Component', () => {
  const mockAgent = {
    id: 'agent-123',
    name: 'Test Agent',
    description: 'This is a test agent',
    model: 'gpt-4',
    userId: 'user-123',
    createdAt: new Date('2022-12-31'),
    updatedAt: new Date('2022-12-31'),
  };

  afterEach(() => {
    cleanup();
  });

  it('renders agent information correctly', () => {
    render(<AgentCard data={mockAgent} />);
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('This is a test agent')).toBeInTheDocument();
    expect(screen.getByText(/gpt-4/)).toBeInTheDocument();
  });

  it('renders a default message when description is missing', () => {
    const agentWithoutDescription = { 
      ...mockAgent, 
      description: null
    };
    render(<AgentCard data={agentWithoutDescription} />);
    
    expect(screen.getByText('No description provided')).toBeInTheDocument();
  });

  it('uses avatar.vercel.sh for the agent image', () => {
    render(<AgentCard data={mockAgent} />);
    
    const image = screen.getByTestId('blur-image');
    expect(image).toHaveAttribute('data-src', 'https://avatar.vercel.sh/agent-123');
  });

  it('has the correct card structure', () => {
    const { container } = render(<AgentCard data={mockAgent} />);
    
    // Check card container
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('shadow-md');
    
    // Check main link
    const mainLink = card.querySelector('a');
    expect(mainLink).toHaveAttribute('href', '/agents/agent-123');
    
    // Check action buttons
    const actions = card.querySelector('.absolute.bottom-4');
    expect(actions).not.toBeNull();
    
    const actionButtons = actions?.querySelectorAll('a');
    expect(actionButtons?.length).toBe(1);
    
    // Check Edit button
    expect(actionButtons?.[0]).toHaveAttribute('href', '/agents/agent-123/edit');
    expect(actionButtons?.[0].textContent).toContain('Edit');
  });

  it('shows model name correctly', () => {
    const { container } = render(<AgentCard data={mockAgent} />);
    
    // Check model name
    const modelElement = container.querySelector('p.mt-2.text-xs');
    expect(modelElement?.textContent).toContain('Model: gpt-4');
  });
}); 