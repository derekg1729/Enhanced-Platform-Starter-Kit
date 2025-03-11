import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ThemeCard from '../../../../components/ui/ThemeCard';

describe('ThemeCard', () => {
  it('renders children correctly', () => {
    render(<ThemeCard>Test Content</ThemeCard>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies the default styling', () => {
    const { container } = render(<ThemeCard>Test Content</ThemeCard>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('border-stone-700');
    expect(card).toHaveClass('bg-stone-900');
    expect(card).toHaveClass('p-5');
  });

  it('merges custom className with default classes', () => {
    const { container } = render(<ThemeCard className="custom-class">Test Content</ThemeCard>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('border');
  });

  it('passes additional props to the div element', () => {
    const { container } = render(
      <ThemeCard data-testid="theme-card" aria-label="Card component">
        Test Content
      </ThemeCard>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveAttribute('data-testid', 'theme-card');
    expect(card).toHaveAttribute('aria-label', 'Card component');
  });

  it('renders with hover effects', () => {
    const { container } = render(<ThemeCard>Test Content</ThemeCard>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('hover:shadow-md');
    expect(card).toHaveClass('transition-all');
  });
}); 