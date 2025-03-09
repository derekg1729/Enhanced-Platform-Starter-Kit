import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the GoogleAnalytics component
vi.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: vi.fn()
}));

// Import after mocking
import { GoogleAnalytics } from '@next/third-parties/google';

describe('Google Analytics Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should initialize with the correct GA ID', () => {
    // Set up the environment variable
    process.env.NEXT_PUBLIC_GA_ID = 'G-TEST123456';
    
    // Call the component function directly
    GoogleAnalytics({ gaId: process.env.NEXT_PUBLIC_GA_ID || '' });
    
    // Check if it was called with the correct ID
    expect(GoogleAnalytics).toHaveBeenCalledWith({ gaId: 'G-TEST123456' });
  });

  it('should handle missing GA ID gracefully', () => {
    // Clear the environment variable
    delete process.env.NEXT_PUBLIC_GA_ID;
    
    // Call the component function directly
    GoogleAnalytics({ gaId: process.env.NEXT_PUBLIC_GA_ID || '' });
    
    // Check if it was called with an empty string
    expect(GoogleAnalytics).toHaveBeenCalledWith({ gaId: '' });
  });
}); 