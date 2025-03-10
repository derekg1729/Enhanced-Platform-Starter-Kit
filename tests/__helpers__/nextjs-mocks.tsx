import React from 'react';

/**
 * Mock for Next.js Image component
 * This provides a proper implementation that can be used in tests
 * while avoiding the ESLint warning about using <img> elements
 */
export const MockNextImage = ({
  src = 'https://placeholder.com/150',
  alt = 'Mock image',
  width = 100,
  height = 100,
  fill = false,
  className = '',
  priority = false,
  ...props
}: {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  [key: string]: any;
}) => {
  // We need to use the img element here, but we're doing it in a controlled way
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-testid="mock-image"
      {...props}
    />
  );
};

/**
 * Mock for Next.js Link component
 */
export const MockNextLink = ({
  href = '#',
  children,
  className = '',
  ...props
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
}; 