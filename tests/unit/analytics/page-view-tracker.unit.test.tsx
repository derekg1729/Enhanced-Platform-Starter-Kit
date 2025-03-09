/**
 * Unit tests for PageViewTracker component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// Mock the analytics utilities first
vi.mock('@/lib/analytics', () => ({
  trackPageView: vi.fn(),
}));

// Import the mocked analytics function
import { trackPageView } from '@/lib/analytics';

// Mock the next/navigation hooks
vi.mock('next/navigation', () => ({
  usePathname: vi.fn().mockReturnValue('/test-page'),
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
}));

// Import the component after all mocks are set up
import PageViewTracker from '@/components/analytics/page-view-tracker';

describe('PageViewTracker', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(usePathname).mockReturnValue('/test-page');
  });

  it('should track page view on initial render', () => {
    // Render the component
    render(<PageViewTracker />);

    // Verify that trackPageView was called with the correct page name
    expect(trackPageView).toHaveBeenCalledWith('test-page');
  });

  it('should track page view when pathname changes', () => {
    // Mock the pathname
    vi.mocked(usePathname).mockReturnValue('/dashboard');

    // Render the component
    render(<PageViewTracker />);

    // Verify that trackPageView was called with the correct page name
    expect(trackPageView).toHaveBeenCalledWith('dashboard');
  });

  it('should use "home" as the page name for root path', () => {
    // Mock the pathname to be the root path
    vi.mocked(usePathname).mockReturnValue('/');

    // Render the component
    render(<PageViewTracker />);

    // Verify that trackPageView was called with "home"
    expect(trackPageView).toHaveBeenCalledWith('home');
  });

  it('should extract the last segment of the path as the page name', () => {
    // Mock a nested pathname
    vi.mocked(usePathname).mockReturnValue('/app/site/123');

    // Render the component
    render(<PageViewTracker />);

    // Verify that trackPageView was called with the last segment
    expect(trackPageView).toHaveBeenCalledWith('123');
  });
});

// Import the next/navigation hooks after the tests
import { usePathname, useSearchParams } from 'next/navigation'; 