import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary'); // default variant
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    let button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('bg-secondary');
    
    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole('button', { name: /outline/i });
    expect(button).toHaveClass('border-input');
    
    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole('button', { name: /ghost/i });
    expect(button).toHaveClass('hover:bg-accent');
    
    rerender(<Button variant="link">Link</Button>);
    button = screen.getByRole('button', { name: /link/i });
    expect(button).toHaveClass('text-primary');
    
    rerender(<Button variant="primary">Primary</Button>);
    button = screen.getByRole('button', { name: /primary/i });
    expect(button).toHaveClass('bg-blue-600');
    
    rerender(<Button variant="danger">Danger</Button>);
    button = screen.getByRole('button', { name: /danger/i });
    expect(button).toHaveClass('bg-red-600');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole('button', { name: /small/i });
    expect(button).toBeInTheDocument();
    
    rerender(<Button size="default">Default</Button>);
    button = screen.getByRole('button', { name: /default/i });
    expect(button).toBeInTheDocument();
    
    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button', { name: /large/i });
    expect(button).toBeInTheDocument();
    
    rerender(<Button size="icon">Icon</Button>);
    button = screen.getByRole('button', { name: /icon/i });
    expect(button).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    const spinner = document.querySelector('svg.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with left icon correctly', () => {
    const LeftIcon = () => <span data-testid="left-icon">Icon</span>;
    render(<Button leftIcon={<LeftIcon />}>With Icon</Button>);
    const button = screen.getByRole('button', { name: /with icon/i });
    const icon = screen.getByTestId('left-icon');
    expect(icon).toBeInTheDocument();
    expect(icon.parentElement).toHaveClass('mr-2');
  });

  it('renders with right icon correctly', () => {
    const RightIcon = () => <span data-testid="right-icon">Icon</span>;
    render(<Button rightIcon={<RightIcon />}>With Icon</Button>);
    const button = screen.getByRole('button', { name: /with icon/i });
    const icon = screen.getByTestId('right-icon');
    expect(icon).toBeInTheDocument();
    expect(icon.parentElement).toHaveClass('ml-2');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when loading', () => {
    const handleClick = vi.fn();
    render(<Button isLoading onClick={handleClick}>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies additional className correctly', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button', { name: /custom/i });
    expect(button).toHaveClass('custom-class');
    // Should still have the default classes
    expect(button).toHaveClass('bg-primary');
  });
}); 