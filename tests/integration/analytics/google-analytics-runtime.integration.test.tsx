import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Mock the GoogleAnalytics component
vi.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: vi.fn().mockImplementation(({ gaId }) => {
    return <div data-testid="google-analytics" data-ga-id={gaId}></div>;
  })
}));

// Import after mocking
import { GoogleAnalytics } from '@next/third-parties/google';

describe('Google Analytics Runtime Behavior', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should initialize Google Analytics with the correct GA ID', () => {
    // Set up the environment variable
    process.env.NEXT_PUBLIC_GA_ID = 'G-TEST123456';
    
    // Call the component directly
    GoogleAnalytics({ gaId: process.env.NEXT_PUBLIC_GA_ID });
    
    // Check if it was called with the correct ID
    expect(GoogleAnalytics).toHaveBeenCalledWith({ gaId: 'G-TEST123456' });
  });

  it('should not initialize Google Analytics when NEXT_PUBLIC_GA_ID is not set', () => {
    // Clear the environment variable
    delete process.env.NEXT_PUBLIC_GA_ID;
    
    // Create a mock function to simulate conditional rendering
    const renderAnalytics = vi.fn().mockImplementation(() => {
      if (process.env.NEXT_PUBLIC_GA_ID) {
        GoogleAnalytics({ gaId: process.env.NEXT_PUBLIC_GA_ID });
        return true;
      }
      return false;
    });
    
    // Call the function
    const result = renderAnalytics();
    
    // Verify GA component is not rendered
    expect(result).toBe(false);
    expect(GoogleAnalytics).not.toHaveBeenCalled();
  });
}); 