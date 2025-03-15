import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  encrypt, 
  decrypt, 
  generateEncryptionKey,
  encryptApiKey,
  decryptApiKey
} from '@/lib/encryption';

describe('Encryption Utilities', () => {
  // Test key (32 bytes = 64 hex characters)
  const testKey = 'd2e372921d15fe9312e6d45740ded074a019027122525ec390889154ba85d72f';
  
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const originalText = 'test-api-key-12345';
      const encrypted = encrypt(originalText, testKey);
      
      // Encrypted text should be different from original
      expect(encrypted).not.toBe(originalText);
      
      // Should contain two separators (format: iv:authTag:encryptedData)
      expect(encrypted.split(':').length).toBe(3);
      
      // Should decrypt back to original
      const decrypted = decrypt(encrypted, testKey);
      expect(decrypted).toBe(originalText);
    });
    
    it('should encrypt the same text to different ciphertexts (due to random IV)', () => {
      const originalText = 'test-api-key-12345';
      const encrypted1 = encrypt(originalText, testKey);
      const encrypted2 = encrypt(originalText, testKey);
      
      // Encryptions should be different due to random IV
      expect(encrypted1).not.toBe(encrypted2);
      
      // But both should decrypt to the same original text
      expect(decrypt(encrypted1, testKey)).toBe(originalText);
      expect(decrypt(encrypted2, testKey)).toBe(originalText);
    });
    
    it('should throw error when encrypting with invalid key', () => {
      const originalText = 'test-api-key-12345';
      const invalidKey = 'too-short-key';
      
      expect(() => encrypt(originalText, invalidKey)).toThrow('Invalid encryption key');
    });
    
    it('should throw error when decrypting with wrong key', () => {
      const originalText = 'test-api-key-12345';
      const encrypted = encrypt(originalText, testKey);
      const wrongKey = 'e3e472921d15fe9312e6d45740ded074a019027122525ec390889154ba85d72f';
      
      expect(() => decrypt(encrypted, wrongKey)).toThrow();
    });
    
    it('should throw error when decrypting invalid format', () => {
      const invalidEncrypted = 'invalid-format';
      
      expect(() => decrypt(invalidEncrypted, testKey)).toThrow('Invalid encrypted data format');
    });
    
    it('should handle empty string encryption and decryption', () => {
      const emptyString = '';
      const encrypted = encrypt(emptyString, testKey);
      const decrypted = decrypt(encrypted, testKey);
      
      expect(decrypted).toBe(emptyString);
    });
    
    it('should handle special characters in the text', () => {
      const specialChars = 'Special @#$%^&*()_+{}[]|\\:;"\'<>,.?/~`!';
      const encrypted = encrypt(specialChars, testKey);
      const decrypted = decrypt(encrypted, testKey);
      
      expect(decrypted).toBe(specialChars);
    });
    
    it('should handle long text', () => {
      const longText = 'a'.repeat(1000);
      const encrypted = encrypt(longText, testKey);
      const decrypted = decrypt(encrypted, testKey);
      
      expect(decrypted).toBe(longText);
    });
  });
  
  describe('generateEncryptionKey', () => {
    it('should generate a valid encryption key', () => {
      const key = generateEncryptionKey();
      
      // Key should be a hex string of 64 characters (32 bytes)
      expect(key).toMatch(/^[0-9a-f]{64}$/);
      
      // Key should be usable for encryption/decryption
      const originalText = 'test-text';
      const encrypted = encrypt(originalText, key);
      const decrypted = decrypt(encrypted, key);
      
      expect(decrypted).toBe(originalText);
    });
    
    it('should generate different keys on each call', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();
      
      expect(key1).not.toBe(key2);
    });
  });
  
  describe('encryptApiKey and decryptApiKey', () => {
    const originalEnv = process.env;
    
    beforeEach(() => {
      // Reset environment variables before each test
      vi.resetModules();
      process.env = { ...originalEnv };
    });
    
    afterEach(() => {
      // Restore environment variables after each test
      process.env = originalEnv;
    });
    
    it('should encrypt and decrypt API key using environment variable', async () => {
      process.env.ENCRYPTION_KEY = testKey;
      
      const apiKey = 'sk-test-api-key-12345';
      const encrypted = await encryptApiKey(apiKey);
      
      // Encrypted key should be different from original
      expect(encrypted).not.toBe(apiKey);
      
      // Should decrypt back to original
      const decrypted = await decryptApiKey(encrypted);
      expect(decrypted).toBe(apiKey);
    });
    
    it('should use default key if environment variable is not set', async () => {
      // Ensure ENCRYPTION_KEY is not set
      delete process.env.ENCRYPTION_KEY;
      
      const apiKey = 'sk-test-api-key-12345';
      const encrypted = await encryptApiKey(apiKey);
      
      // Should still be able to decrypt
      const decrypted = await decryptApiKey(encrypted);
      expect(decrypted).toBe(apiKey);
    });
    
    it('should throw error when decrypting invalid API key', async () => {
      const invalidEncrypted = 'invalid-encrypted-key';
      
      await expect(decryptApiKey(invalidEncrypted)).rejects.toThrow();
    });
  });
}); 