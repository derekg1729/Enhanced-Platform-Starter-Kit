import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store the original environment variables
const originalEnv = { ...process.env };

// Import the functions to test
import { 
  getEncryptionKey
} from '../../lib/api-key-utils';

describe('API Key Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore environment variables after each test
    process.env = { ...originalEnv };
  });

  describe('getEncryptionKey', () => {
    it('should return the encryption key from environment variable', () => {
      // Set the environment variable
      process.env.API_KEY_ENCRYPTION_KEY = 'test-encryption-key-that-is-at-least-32-chars';
      
      const key = getEncryptionKey();
      
      expect(key).toBe('test-encryption-key-that-is-at-least-32-chars');
    });

    it('should throw an error when encryption key is not set', () => {
      // Ensure the environment variable is not set
      delete process.env.API_KEY_ENCRYPTION_KEY;
      
      // The function should throw an error
      expect(() => getEncryptionKey()).toThrow('API_KEY_ENCRYPTION_KEY environment variable is not set');
    });

    it('should throw an error when encryption key is too short', () => {
      // Set an invalid encryption key (too short)
      process.env.API_KEY_ENCRYPTION_KEY = 'short';
      
      // The function should throw an error
      expect(() => getEncryptionKey()).toThrow('API_KEY_ENCRYPTION_KEY must be at least 32 characters long');
    });
  });
}); 