import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '@/components/ui/Card';

describe('Card Component', () => {
  it('renders correctly with default props', () => {
    render(<Card data-testid="card">Card content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('border-gray-200');
    expect(card).toHaveClass('shadow-sm');
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<Card data-testid="card" variant="default">Default Card</Card>);
    let card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('border-gray-200');
    expect(card).toHaveClass('shadow-sm');

    rerender(<Card data-testid="card" variant="elevated">Elevated Card</Card>);
    card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('shadow-md');
    expect(card).not.toHaveClass('border-gray-200');

    rerender(<Card data-testid="card" variant="outlined">Outlined Card</Card>);
    card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('border-gray-200');
    expect(card).not.toHaveClass('shadow-sm');

    rerender(<Card data-testid="card" variant="flat">Flat Card</Card>);
    card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-gray-50');
    expect(card).not.toHaveClass('border-gray-200');
    expect(card).not.toHaveClass('shadow-sm');
  });

  it('applies additional className correctly', () => {
    render(<Card data-testid="card" className="custom-class">Custom Card</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
    // Should still have the default classes
    expect(card).toHaveClass('bg-white');
  });

  it('renders children correctly', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card description</p>
      </Card>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card description')).toBeInTheDocument();
  });

  it('passes additional props to the div element', () => {
    render(<Card data-testid="test-card">Card with props</Card>);
    const card = screen.getByTestId('test-card');
    expect(card).toHaveTextContent('Card with props');
  });

  it('has correct default styling', () => {
    render(<Card data-testid="styled-card">Styled Card</Card>);
    const card = screen.getByTestId('styled-card');
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('p-6');
  });
}); 