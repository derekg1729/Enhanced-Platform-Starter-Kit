import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CreateSiteButton from '@/components/create-site-button';
import { useModal } from '@/components/modal/provider';
import { trackSite } from '@/lib/analytics';

// Mock the modal provider
vi.mock('@/components/modal/provider', () => ({
  useModal: vi.fn(),
}));

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackSite: {
    create: vi.fn(),
  },
}));

describe('CreateSiteButton Component', () => {
  const mockShow = vi.fn();
  const mockChildren = <div data-testid="modal-content">Modal Content</div>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModal).mockReturnValue({
      show: mockShow,
      hide: vi.fn(),
    });
  });

  it('renders with correct text', () => {
    render(<CreateSiteButton>{mockChildren}</CreateSiteButton>);
    
    const button = screen.getByRole('button', { name: 'Create New Site' });
    expect(button).toBeInTheDocument();
  });

  it('has correct styling', () => {
    render(<CreateSiteButton>{mockChildren}</CreateSiteButton>);
    
    const button = screen.getByRole('button');
    
    // Check base styling
    expect(button).toHaveClass('rounded-lg');
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('border-black');
    expect(button).toHaveClass('bg-black');
    expect(button).toHaveClass('text-white');
    
    // Check hover and active states
    expect(button).toHaveClass('hover:bg-white');
    expect(button).toHaveClass('hover:text-black');
    expect(button).toHaveClass('active:bg-stone-100');
    
    // Check dark mode styling
    expect(button).toHaveClass('dark:border-stone-700');
    expect(button).toHaveClass('dark:hover:border-stone-200');
    expect(button).toHaveClass('dark:hover:bg-black');
    expect(button).toHaveClass('dark:hover:text-white');
    expect(button).toHaveClass('dark:active:bg-stone-800');
  });

  it('shows modal with children when clicked', () => {
    render(<CreateSiteButton>{mockChildren}</CreateSiteButton>);
    
    const button = screen.getByRole('button');
    
    // Click the button
    fireEvent.click(button);
    
    // Check if modal.show was called with the children
    expect(mockShow).toHaveBeenCalledTimes(1);
    expect(mockShow).toHaveBeenCalledWith(mockChildren);
  });

  it('tracks site creation when clicked', () => {
    render(<CreateSiteButton>{mockChildren}</CreateSiteButton>);
    
    const button = screen.getByRole('button');
    
    // Click the button
    fireEvent.click(button);
    
    // Check if analytics tracking was called
    expect(trackSite.create).toHaveBeenCalledTimes(1);
  });

  it('calls functions in the correct order', () => {
    // Create a mock implementation to track call order
    const calls: string[] = [];
    
    vi.mocked(trackSite.create).mockImplementation(() => {
      calls.push('trackSite.create');
    });
    
    vi.mocked(mockShow).mockImplementation(() => {
      calls.push('modal.show');
    });
    
    render(<CreateSiteButton>{mockChildren}</CreateSiteButton>);
    
    const button = screen.getByRole('button');
    
    // Click the button
    fireEvent.click(button);
    
    // Check if functions were called in the correct order
    expect(calls).toEqual(['trackSite.create', 'modal.show']);
  });

  it('handles case when modal is null', () => {
    // Mock useModal to return undefined instead of null
    vi.mocked(useModal).mockReturnValue(undefined);
    
    render(<CreateSiteButton>{mockChildren}</CreateSiteButton>);
    
    const button = screen.getByRole('button');
    
    // This should not throw an error
    expect(() => {
      fireEvent.click(button);
    }).not.toThrow();
    
    // Analytics should still be called
    expect(trackSite.create).toHaveBeenCalledTimes(1);
  });
}); 