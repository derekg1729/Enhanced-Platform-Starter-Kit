import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

describe('Google Analytics Environment Variables', () => {
  // Load environment variables from .env files
  beforeAll(() => {
    // Load .env.local if it exists
    const envLocalPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
      for (const k in envConfig) {
        process.env[k] = envConfig[k];
      }
    }
  });

  it('should have NEXT_PUBLIC_GA_ID defined in environment', () => {
    expect(process.env.NEXT_PUBLIC_GA_ID).toBeDefined();
  });

  it('should have a real Google Analytics ID, not a placeholder', () => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    
    // Skip this test if GA ID is not defined (the previous test will fail)
    if (!gaId) {
      return;
    }
    
    // Check if it's a valid GA4 ID (starts with G- followed by alphanumeric characters)
    const isValidGaId = /^G-[A-Z0-9]{10,}$/i.test(gaId);
    
    // Check if it's a placeholder
    const isPlaceholder = 
      gaId === '' || 
      gaId === 'YOUR_GA_ID' || 
      gaId === 'G-XXXXXXXXXX' ||
      gaId.includes('XXXXXXXXXX');
    
    // Test should fail if using a placeholder
    if (isPlaceholder) {
      throw new Error(`
        Using a placeholder for Google Analytics ID: ${gaId}
        You must replace this with a real Google Analytics 4 Measurement ID.
        The ID should start with G- followed by alphanumeric characters.
        Example: G-ABC123XYZ9
      `);
    }
    
    // Verify it's a valid GA ID format
    expect(isValidGaId).toBeTruthy();
  });

  it('should have a valid Google Analytics ID format', () => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    
    // Skip this test if GA ID is not defined (the first test will fail)
    if (!gaId) {
      return;
    }
    
    // Check if it's a valid GA4 ID (starts with G- followed by alphanumeric characters)
    const isValidGaId = /^G-[A-Z0-9]{10,}$/i.test(gaId);
    
    if (!isValidGaId) {
      console.error(`Invalid Google Analytics ID format: ${gaId}`);
      console.error('Expected format: G-XXXXXXXXXX (where X is alphanumeric)');
    }
    
    expect(isValidGaId).toBeTruthy();
  });

  it('should have Google Analytics ID in production environment for deployment', () => {
    // This test is meant to fail in CI/CD if GA ID is not set for production
    // Skip in development environment
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.info('Skipping production GA ID check in development/test environment');
      return;
    }
    
    // In production, we require a valid GA ID (not a placeholder)
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    expect(gaId).toBeDefined();
    
    const isValidGaId = /^G-[A-Z0-9]{10,}$/i.test(gaId || '');
    expect(isValidGaId).toBeTruthy();
  });
}); 