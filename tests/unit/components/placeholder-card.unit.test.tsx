import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PlaceholderCard from '@/components/placeholder-card';

describe('PlaceholderCard Component', () => {
  it('renders with correct structure', () => {
    const { container } = render(<PlaceholderCard />);
    
    // Check if the main container has the correct classes
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('rounded-lg');
    expect(mainContainer).toHaveClass('border');
    expect(mainContainer).toHaveClass('shadow-md');
    expect(mainContainer).toHaveClass('hover:shadow-xl');
    
    // Check if the component has the expected structure
    const imageContainer = mainContainer.firstChild as HTMLElement;
    expect(imageContainer).toHaveClass('h-44');
    expect(imageContainer).toHaveClass('animate-pulse');
    
    // Check if the content section exists
    const contentSection = mainContainer.childNodes[1] as HTMLElement;
    expect(contentSection).toHaveClass('p-4');
    
    // Check if the content section has the expected placeholder elements
    const placeholderElements = contentSection.childNodes;
    expect(placeholderElements.length).toBe(3);
    
    // Check each placeholder element
    for (let i = 0; i < placeholderElements.length; i++) {
      const element = placeholderElements[i] as HTMLElement;
      expect(element).toHaveClass('animate-pulse');
      expect(element).toHaveClass('rounded-lg');
    }
  });

  it('has dark mode styles', () => {
    const { container } = render(<PlaceholderCard />);
    
    // Check if the main container has dark mode classes
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('dark:border-stone-700');
    
    // Check if the image container has dark mode classes
    const imageContainer = mainContainer.firstChild as HTMLElement;
    expect(imageContainer).toHaveClass('dark:bg-stone-800');
    
    // Check if the placeholder elements have dark mode classes
    const contentSection = mainContainer.childNodes[1] as HTMLElement;
    const placeholderElements = contentSection.childNodes;
    
    for (let i = 0; i < placeholderElements.length; i++) {
      const element = placeholderElements[i] as HTMLElement;
      expect(element).toHaveClass('dark:bg-stone-800');
    }
  });

  it('has animation styles', () => {
    const { container } = render(<PlaceholderCard />);
    
    // Check if the image container has animation classes
    const mainContainer = container.firstChild as HTMLElement;
    const imageContainer = mainContainer.firstChild as HTMLElement;
    expect(imageContainer).toHaveClass('animate-pulse');
    
    // Check if the placeholder elements have animation classes
    const contentSection = mainContainer.childNodes[1] as HTMLElement;
    const placeholderElements = contentSection.childNodes;
    
    for (let i = 0; i < placeholderElements.length; i++) {
      const element = placeholderElements[i] as HTMLElement;
      expect(element).toHaveClass('animate-pulse');
    }
  });

  it('has responsive sizing', () => {
    const { container } = render(<PlaceholderCard />);
    
    // Check if the image container has responsive width
    const mainContainer = container.firstChild as HTMLElement;
    const imageContainer = mainContainer.firstChild as HTMLElement;
    expect(imageContainer).toHaveClass('w-full');
    
    // Check if the placeholder elements have different widths
    const contentSection = mainContainer.childNodes[1] as HTMLElement;
    const placeholderElements = contentSection.childNodes;
    
    // First element should be half width
    expect(placeholderElements[0]).toHaveClass('w-1/2');
    
    // Second element should be three-quarters width
    expect(placeholderElements[1]).toHaveClass('w-3/4');
    
    // Third element should be half width
    expect(placeholderElements[2]).toHaveClass('w-1/2');
  });
}); 