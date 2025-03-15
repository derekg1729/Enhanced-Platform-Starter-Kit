import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import BlurImage from '@/components/blur-image';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ onLoad, className, alt = '', src, ...props }: any) => {
    // Filter out props that cause React warnings in tests
    const { placeholder, blurDataURL, priority, ...validProps } = props;
    
    return (
      <div
        data-testid="next-image"
        data-alt={alt}
        data-src={src}
        className={className}
        onClick={onLoad}
        // Store special props as data attributes for testing
        data-placeholder={placeholder}
        data-blur-data-url={blurDataURL}
        data-priority={priority ? 'true' : undefined}
        {...validProps}
      />
    );
  },
}));

describe('BlurImage Component', () => {
  it('renders with initial loading state', () => {
    render(
      <BlurImage
        src="/test-image.jpg"
        alt="Test image"
        width={500}
        height={300}
      />
    );
    
    const image = screen.getByTestId('next-image');
    
    // Should have blur class when loading
    expect(image.className).toContain('scale-105');
    expect(image.className).toContain('blur-lg');
    expect(image.className).not.toContain('scale-100');
    expect(image.className).not.toContain('blur-0');
  });
  
  it('transitions to loaded state when image loads', () => {
    render(
      <BlurImage
        src="/test-image.jpg"
        alt="Test image"
        width={500}
        height={300}
      />
    );
    
    const image = screen.getByTestId('next-image');
    
    // Initially in loading state
    expect(image.className).toContain('scale-105');
    expect(image.className).toContain('blur-lg');
    
    // Trigger the onLoad event via click for div
    fireEvent.click(image);
    
    // Should transition to loaded state
    expect(image.className).toContain('scale-100');
    expect(image.className).toContain('blur-0');
    expect(image.className).not.toContain('scale-105');
    expect(image.className).not.toContain('blur-lg');
  });
  
  it('preserves additional className props', () => {
    render(
      <BlurImage
        src="/test-image.jpg"
        alt="Test image"
        width={500}
        height={300}
        className="custom-class h-44 object-cover"
      />
    );
    
    const image = screen.getByTestId('next-image');
    
    // Should include custom classes
    expect(image.className).toContain('custom-class');
    expect(image.className).toContain('h-44');
    expect(image.className).toContain('object-cover');
    
    // And still have the loading classes
    expect(image.className).toContain('scale-105');
    expect(image.className).toContain('blur-lg');
  });
  
  it('passes through all image props to next/image', () => {
    render(
      <BlurImage
        src="/test-image.jpg"
        alt="Test image"
        width={500}
        height={300}
        placeholder="blur"
        blurDataURL="data:image/png;base64,test"
        priority
      />
    );
    
    const image = screen.getByTestId('next-image');
    
    // Check props are passed through
    expect(image).toHaveAttribute('data-src', '/test-image.jpg');
    expect(image).toHaveAttribute('data-alt', 'Test image');
    expect(image).toHaveAttribute('width', '500');
    expect(image).toHaveAttribute('height', '300');
    
    // Check special props stored as data attributes
    expect(image).toHaveAttribute('data-placeholder', 'blur');
    expect(image).toHaveAttribute('data-blur-data-url', 'data:image/png;base64,test');
    expect(image).toHaveAttribute('data-priority', 'true');
  });
  
  it('handles missing alt text gracefully', () => {
    // This should not throw an error
    render(
      <BlurImage
        src="/test-image.jpg"
        alt=""
        width={500}
        height={300}
      />
    );
    
    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('data-alt', '');
  });
}); 