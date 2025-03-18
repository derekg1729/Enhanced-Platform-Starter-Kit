import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CreateAgentButton from '@/components/create-agent-button';
import { trackAgent } from '@/lib/analytics';
import { useModal } from '@/components/modal/provider';

// Mock dependencies
vi.mock('@/lib/analytics', () => ({
  trackAgent: {
    create: vi.fn(),
  },
}));

vi.mock('@/components/modal/provider', () => ({
  useModal: vi.fn(() => ({
    show: vi.fn(),
    hide: vi.fn(),
  })),
}));

describe('CreateAgentButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with correct text', () => {
    render(<CreateAgentButton>Modal Content</CreateAgentButton>);
    
    const button = screen.getByRole('button', { name: 'Create New Agent' });
    expect(button).toBeInTheDocument();
  });

  it('has the correct styling', () => {
    render(<CreateAgentButton>Modal Content</CreateAgentButton>);
    
    const button = screen.getByRole('button');
    
    // Check base styling
    expect(button).toHaveClass('rounded-lg');
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('border-black');
    expect(button).toHaveClass('bg-black');
    expect(button).toHaveClass('text-white');
    
    // Check hover states
    expect(button).toHaveClass('hover:bg-white');
    expect(button).toHaveClass('hover:text-black');
    
    // Check dark mode styling
    expect(button).toHaveClass('dark:border-stone-700');
    expect(button).toHaveClass('dark:hover:border-stone-200');
  });

  it('tracks agent creation when clicked', () => {
    render(<CreateAgentButton>Modal Content</CreateAgentButton>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(trackAgent.create).toHaveBeenCalledTimes(1);
  });

  it('shows modal with children when clicked', () => {
    const mockShow = vi.fn();
    vi.mocked(useModal).mockReturnValue({
      show: mockShow,
      hide: vi.fn(),
    });
    
    render(<CreateAgentButton>Modal Content</CreateAgentButton>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockShow).toHaveBeenCalledWith('Modal Content');
  });
}); 