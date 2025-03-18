import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import AgentsLayout from '@/app/app/(dashboard)/agents/layout';

// Mock the children component
const MockChildren = () => <div data-testid="mock-children">Children Content</div>;

describe('Agents Layout', () => {
  it('renders children correctly', () => {
    render(<AgentsLayout>{<MockChildren />}</AgentsLayout>);
    
    expect(screen.getByTestId('mock-children')).toBeInTheDocument();
  });

  it('has the correct layout structure', () => {
    const { container } = render(<AgentsLayout>{<MockChildren />}</AgentsLayout>);
    
    // The layout should have a section element
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    
    // The section should contain the children
    expect(section?.contains(screen.getByTestId('mock-children'))).toBe(true);
  });

  it('applies the correct styling', () => {
    const { container } = render(<AgentsLayout>{<MockChildren />}</AgentsLayout>);
    
    const section = container.querySelector('section');
    
    // Check for appropriate styling classes
    expect(section).toHaveClass('flex');
    expect(section).toHaveClass('flex-col');
    expect(section).toHaveClass('gap-4');
  });
}); 