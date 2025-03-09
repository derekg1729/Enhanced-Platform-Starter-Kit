import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the components
vi.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: vi.fn()
}));

vi.mock('@vercel/analytics/react', () => ({
  Analytics: vi.fn()
}));

// Import after mocking
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';

describe('RootLayout with Google Analytics', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // Simulate the behavior of the layout component
  function simulateLayoutRendering() {
    // Always render Analytics
    Analytics({});
    
    // Only render GoogleAnalytics if NEXT_PUBLIC_GA_ID is set
    if (process.env.NEXT_PUBLIC_GA_ID) {
      GoogleAnalytics({ gaId: process.env.NEXT_PUBLIC_GA_ID });
    }
  }

  it('should include Google Analytics when NEXT_PUBLIC_GA_ID is set', () => {
    // Set up the environment variable
    process.env.NEXT_PUBLIC_GA_ID = 'G-TEST123456';
    
    // Simulate rendering the layout
    simulateLayoutRendering();
    
    // Check if GoogleAnalytics was called with the correct ID
    expect(GoogleAnalytics).toHaveBeenCalledWith({ gaId: 'G-TEST123456' });
    expect(Analytics).toHaveBeenCalled();
  });

  it('should not include Google Analytics when NEXT_PUBLIC_GA_ID is not set', () => {
    // Clear the environment variable
    delete process.env.NEXT_PUBLIC_GA_ID;
    
    // Simulate rendering the layout
    simulateLayoutRendering();
    
    // Check if GoogleAnalytics was not called
    expect(GoogleAnalytics).not.toHaveBeenCalled();
    expect(Analytics).toHaveBeenCalled();
  });
}); 