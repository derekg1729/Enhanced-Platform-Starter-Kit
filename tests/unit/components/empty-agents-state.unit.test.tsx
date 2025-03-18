import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import EmptyAgentsState from '@/components/empty-agents-state';

// Mock the Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, onError }: any) => (
    <div 
      data-testid="next-image" 
      data-src={src}
      data-alt={alt}
      onClick={() => onError && onError(new Error('Image failed to load'))}
    />
  ),
}));

// Mock the Bot icon
vi.mock('lucide-react', () => ({
  Bot: () => <div data-testid="bot-icon">Bot Icon</div>,
}));

describe('EmptyAgentsState Component', () => {
  it('renders the empty state correctly', () => {
    render(<EmptyAgentsState />);
    
    // Check for heading
    expect(screen.getByText('No Agents Yet')).toBeInTheDocument();
    
    // Check for description
    expect(screen.getByText('You do not have any agents yet. Create one to get started.')).toBeInTheDocument();
    
    // Check for image
    expect(screen.getByTestId('next-image')).toBeInTheDocument();
    
    // The Bot icon should not be visible initially
    expect(screen.queryByTestId('bot-icon')).not.toBeInTheDocument();
  });

  it('shows the fallback icon when image fails to load', () => {
    render(<EmptyAgentsState />);
    
    // Trigger the image error
    const image = screen.getByTestId('next-image');
    fireEvent.click(image); // This will trigger our mock error handler
    
    // The Bot icon should now be visible
    expect(screen.getByTestId('bot-icon')).toBeInTheDocument();
    
    // The image should no longer be in the document
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
  });
}); 