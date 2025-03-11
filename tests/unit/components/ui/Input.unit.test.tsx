import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/Input';
import { describe, it, expect, vi } from 'vitest';

describe('Input Component', () => {
  it('renders correctly with default props', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('border-stone-700');
    expect(input).toHaveClass('bg-stone-800');
  });

  it('renders with placeholder text', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('renders in error state correctly', () => {
    render(<Input error={true} data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-red-500');
  });

  it('renders in disabled state correctly', () => {
    render(<Input disabled data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeDisabled();
  });

  it('handles user input correctly', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'test input' } });
    expect(input).toHaveValue('test input');
  });

  it('calls onChange handler when input changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} data-testid="input" />);
    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'test input' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies additional className correctly', () => {
    render(<Input className="custom-class" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('custom-class');
    // Should still have the default classes
    expect(input).toHaveClass('border-stone-700');
  });

  it('passes through other props correctly', () => {
    render(<Input type="password" maxLength={10} data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('renders with left icon correctly', () => {
    render(
      <Input
        leftIcon={<span data-testid="left-icon">Icon</span>}
        data-testid="input"
      />
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('input-container')).toBeInTheDocument();
  });

  it('renders with right icon correctly', () => {
    render(
      <Input
        rightIcon={<span data-testid="right-icon">Icon</span>}
        data-testid="input"
      />
    );
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByTestId('input-container')).toBeInTheDocument();
  });
}); 