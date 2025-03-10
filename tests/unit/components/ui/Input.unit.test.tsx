import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '@/components/ui/Input';

describe('Input Component', () => {
  it('renders correctly with default props', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('border-gray-300');
    expect(input).toHaveClass('bg-white');
  });

  it('renders with placeholder text', () => {
    render(<Input placeholder="Enter your name" />);
    const input = screen.getByPlaceholderText('Enter your name');
    expect(input).toBeInTheDocument();
  });

  it('renders in error state correctly', () => {
    render(<Input data-testid="input" error />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-red-500');
    expect(input).toHaveClass('ring-red-200');
  });

  it('renders in disabled state correctly', () => {
    render(<Input data-testid="input" disabled />);
    const input = screen.getByTestId('input');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('bg-gray-100');
    expect(input).toHaveClass('text-gray-500');
  });

  it('handles user input correctly', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'Hello World' } });
    expect(input).toHaveValue('Hello World');
  });

  it('calls onChange handler when input changes', () => {
    const handleChange = vi.fn();
    render(<Input data-testid="input" onChange={handleChange} />);
    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'Hello World' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies additional className correctly', () => {
    render(<Input data-testid="input" className="custom-class" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('custom-class');
    // Should still have the default classes
    expect(input).toHaveClass('border-gray-300');
  });

  it('passes additional props to the input element', () => {
    render(<Input data-testid="input" type="password" maxLength={10} />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('renders with left icon correctly', () => {
    const LeftIcon = () => <span data-testid="left-icon">🔍</span>;
    render(
      <div data-testid="input-container">
        <Input leftIcon={<LeftIcon />} />
      </div>
    );
    const container = screen.getByTestId('input-container');
    const icon = screen.getByTestId('left-icon');
    expect(icon).toBeInTheDocument();
    expect(container).toContainElement(icon);
  });

  it('renders with right icon correctly', () => {
    const RightIcon = () => <span data-testid="right-icon">✓</span>;
    render(
      <div data-testid="input-container">
        <Input rightIcon={<RightIcon />} />
      </div>
    );
    const container = screen.getByTestId('input-container');
    const icon = screen.getByTestId('right-icon');
    expect(icon).toBeInTheDocument();
    expect(container).toContainElement(icon);
  });
}); 