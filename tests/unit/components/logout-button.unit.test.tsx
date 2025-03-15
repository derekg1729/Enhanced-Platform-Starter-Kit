import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LogoutButton from '@/components/logout-button';
import { signOut } from 'next-auth/react';
import { trackAuth } from '@/lib/analytics';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signOut: vi.fn().mockReturnValue(Promise.resolve({ url: '/api/auth/signout' })),
}));

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackAuth: {
    logout: vi.fn(),
  },
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  LogOut: () => <div data-testid="logout-icon" />,
}));

describe('LogoutButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with logout icon', () => {
    render(<LogoutButton />);
    
    // Check if the logout icon is rendered
    const logoutIcon = screen.getByTestId('logout-icon');
    expect(logoutIcon).toBeInTheDocument();
    
    // Check if the button is rendered
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has correct styling', () => {
    render(<LogoutButton />);
    
    const button = screen.getByRole('button');
    
    // Check base styling
    expect(button).toHaveClass('rounded-lg');
    expect(button).toHaveClass('p-1.5');
    expect(button).toHaveClass('text-stone-700');
    
    // Check hover and active states
    expect(button).toHaveClass('hover:bg-stone-200');
    expect(button).toHaveClass('active:bg-stone-300');
    
    // Check dark mode styling
    expect(button).toHaveClass('dark:text-white');
    expect(button).toHaveClass('dark:hover:bg-stone-700');
    expect(button).toHaveClass('dark:active:bg-stone-800');
  });

  it('calls signOut and tracks logout when clicked', () => {
    render(<LogoutButton />);
    
    const button = screen.getByRole('button');
    
    // Click the button
    fireEvent.click(button);
    
    // Check if signOut was called
    expect(signOut).toHaveBeenCalledTimes(1);
    
    // Check if analytics tracking was called
    expect(trackAuth.logout).toHaveBeenCalledTimes(1);
  });

  it('calls functions in the correct order', () => {
    // Create a mock implementation to track call order
    const calls: string[] = [];
    
    vi.mocked(trackAuth.logout).mockImplementation(() => {
      calls.push('trackAuth.logout');
    });
    
    // Use mockImplementationOnce to avoid affecting other tests
    vi.mocked(signOut).mockImplementationOnce(() => {
      calls.push('signOut');
      return Promise.resolve({ url: '/api/auth/signout' });
    });
    
    render(<LogoutButton />);
    
    const button = screen.getByRole('button');
    
    // Click the button
    fireEvent.click(button);
    
    // Check if functions were called in the correct order
    expect(calls).toEqual(['trackAuth.logout', 'signOut']);
  });
}); 