import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import AgentCard from '../../../../components/agent/AgentCard';
import { useRouter } from 'next/navigation';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('AgentCard', () => {
  const mockAgent = {
    id: '1',
    name: 'Test Agent',
    description: 'This is a test agent',
    image: '/test-image.png',
    createdAt: new Date('2023-01-01'),
    status: 'active' as const,
  };
  
  const mockInactiveAgent = {
    id: '2',
    name: 'Inactive Agent',
    description: 'This is an inactive agent',
    image: '/test-image.png',
    createdAt: new Date('2023-01-01'),
    status: 'inactive' as const,
  };
  
  const mockRouter = {
    push: vi.fn(),
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });
  
  it('renders agent information correctly', () => {
    render(<AgentCard agent={mockAgent} />);
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('This is a test agent')).toBeInTheDocument();
  });
  
  it('displays the creation date', () => {
    render(<AgentCard agent={mockAgent} />);
    
    // Get the element containing the date text
    const dateElement = screen.getByText(/Created:/);
    expect(dateElement).toBeInTheDocument();
    // Check that the element contains the date text (either format is acceptable)
    expect(dateElement.textContent).toMatch(/Jan 1, 2023|Dec 31, 2022/);
  });
  
  it('navigates to agent details page when clicked', () => {
    render(<AgentCard agent={mockAgent} />);
    
    const card = screen.getByRole('link');
    card.click();
    
    expect(mockRouter.push).toHaveBeenCalledWith('/agents/1');
  });
  
  it('displays a placeholder image when no image is provided', () => {
    const agentWithoutImage = { ...mockAgent, image: undefined };
    render(<AgentCard agent={agentWithoutImage} />);
    
    const img = screen.getByRole('img');
    // Next.js Image component transforms the URL, so we check if it contains 'placeholder'
    expect(img).toHaveAttribute('src', expect.stringContaining('placeholder'));
  });
  
  it('shows the correct status indicator', () => {
    render(<AgentCard agent={mockInactiveAgent} />);
    
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toHaveClass('bg-stone-800');
  });
}); 