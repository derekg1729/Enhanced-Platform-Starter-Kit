import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import CreateAgentButton from '../../../../components/agent/CreateAgentButton';
import { useRouter } from 'next/navigation';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('CreateAgentButton', () => {
  const mockRouter = {
    push: vi.fn(),
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });
  
  it('renders the button with correct text', () => {
    render(<CreateAgentButton />);
    
    expect(screen.getByRole('button', { name: /create agent/i })).toBeInTheDocument();
  });
  
  it('renders with a plus icon', () => {
    render(<CreateAgentButton />);
    
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });
  
  it('navigates to the create agent page when clicked', () => {
    render(<CreateAgentButton />);
    
    const button = screen.getByRole('button', { name: /create agent/i });
    button.click();
    
    expect(mockRouter.push).toHaveBeenCalledWith('/agents/new');
  });
  
  it('applies the correct styles', () => {
    render(<CreateAgentButton />);
    
    const button = screen.getByRole('button', { name: /create agent/i });
    expect(button).toHaveClass('bg-blue-600');
    expect(button).toHaveClass('hover:bg-blue-700');
    expect(button).toHaveClass('text-white');
    expect(button).toHaveClass('rounded-lg');
    expect(button).toHaveClass('flex');
    expect(button).toHaveClass('items-center');
    expect(button).toHaveClass('gap-1');
  });
  
  it('can be disabled', () => {
    render(<CreateAgentButton disabled />);
    
    const button = screen.getByRole('button', { name: /create agent/i });
    expect(button).toBeDisabled();
  });
  
  it('shows a loading state when isLoading is true', () => {
    render(<CreateAgentButton isLoading />);
    
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.queryByText('Create Agent')).not.toBeInTheDocument();
    // Check for the SVG loading spinner
    const svgElement = document.querySelector('svg.animate-spin');
    expect(svgElement).toBeInTheDocument();
  });
}); 