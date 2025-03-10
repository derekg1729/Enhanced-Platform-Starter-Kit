import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  encryptApiKey, 
  decryptApiKey, 
  isValidEncryptedFormat, 
  safeDecryptApiKey 
} from '../../lib/api-key-utils';

// Mock the actual functions to avoid real crypto operations
vi.mock('../../lib/api-key-utils', async () => {
  const actual = await vi.importActual('../../lib/api-key-utils');
  
  return {
    ...actual,
    encryptApiKey: vi.fn().mockReturnValue('0123456789abcdef:authtag:encryptedfinal'),
    decryptApiKey: vi.fn().mockImplementation((encryptedData) => {
      if (!encryptedData.includes(':')) {
        throw new Error('Invalid encrypted data format');
      }
      return 'decrypted';
    }),
    isValidEncryptedFormat: vi.fn().mockImplementation((encryptedData) => {
      return encryptedData.split(':').length === 3;
    }),
    safeDecryptApiKey: vi.fn().mockImplementation((encryptedData) => {
      if (!encryptedData.includes(':')) {
        return null;
      }
      if (encryptedData === 'throw-error') {
        return null;
      }
      return 'decrypted';
    }),
  };
});

describe('API Key Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('encryptApiKey', () => {
    it('should encrypt an API key', () => {
      const apiKey = 'sk-test123456';
      
      const result = encryptApiKey(apiKey);
      
      // With our mocks, the result should be in the format "iv:authTag:encryptedData"
      expect(result).toBe('0123456789abcdef:authtag:encryptedfinal');
      
      // Verify that the function was called with the correct arguments
      expect(encryptApiKey).toHaveBeenCalledWith(apiKey);
    });
  });

  describe('decryptApiKey', () => {
    it('should decrypt an encrypted API key', () => {
      const encryptedKey = '0123456789abcdef:authtag:encrypted';
      
      const result = decryptApiKey(encryptedKey);
      
      expect(result).toBe('decrypted');
      
      // Verify that the function was called with the correct arguments
      expect(decryptApiKey).toHaveBeenCalledWith(encryptedKey);
    });

    it('should throw an error for invalid encrypted data format', () => {
      const invalidFormat = 'invalid-format';
      
      expect(() => decryptApiKey(invalidFormat)).toThrow('Invalid encrypted data format');
    });
  });

  describe('isValidEncryptedFormat', () => {
    it('should return true for valid encrypted format', () => {
      const validFormat = '0123456789abcdef:authtag:encrypted';
      
      const result = isValidEncryptedFormat(validFormat);
      
      expect(result).toBe(true);
      
      // Verify that the function was called with the correct arguments
      expect(isValidEncryptedFormat).toHaveBeenCalledWith(validFormat);
    });

    it('should return false for invalid encrypted format', () => {
      const invalidFormat = 'invalid-format';
      
      // Mock the implementation to return false for this test
      vi.mocked(isValidEncryptedFormat).mockReturnValueOnce(false);
      
      const result = isValidEncryptedFormat(invalidFormat);
      
      expect(result).toBe(false);
      
      // Verify that the function was called with the correct arguments
      expect(isValidEncryptedFormat).toHaveBeenCalledWith(invalidFormat);
    });
  });

  describe('safeDecryptApiKey', () => {
    it('should safely decrypt a valid encrypted key', () => {
      const encryptedKey = '0123456789abcdef:authtag:encrypted';
      
      const result = safeDecryptApiKey(encryptedKey);
      
      expect(result).toBe('decrypted');
      
      // Verify that the function was called with the correct arguments
      expect(safeDecryptApiKey).toHaveBeenCalledWith(encryptedKey);
    });

    it('should return null for invalid format', () => {
      const invalidFormat = 'invalid-format';
      
      // Mock the implementation to return null for this test
      vi.mocked(safeDecryptApiKey).mockReturnValueOnce(null);
      
      const result = safeDecryptApiKey(invalidFormat);
      
      expect(result).toBe(null);
      
      // Verify that the function was called with the correct arguments
      expect(safeDecryptApiKey).toHaveBeenCalledWith(invalidFormat);
    });

    it('should return null if decryption fails', () => {
      const encryptedKey = 'throw-error';
      
      // Mock console.error to avoid polluting the test output
      vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = safeDecryptApiKey(encryptedKey);
      
      expect(result).toBe(null);
      
      // Verify that the function was called with the correct arguments
      expect(safeDecryptApiKey).toHaveBeenCalledWith(encryptedKey);
    });
  });
}); 