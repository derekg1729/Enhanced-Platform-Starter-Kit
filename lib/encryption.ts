/**
 * Encryption utilities for securely handling API keys
 * Uses AES-256-GCM encryption for secure storage of sensitive data
 */

import crypto from 'crypto';

// Constants for encryption
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16 bytes
const AUTH_TAG_LENGTH = 16; // For GCM mode, this is 16 bytes
const KEY_LENGTH = 32; // 256 bits = 32 bytes

/**
 * Encrypts a string using AES-256-GCM
 * @param text - The text to encrypt (e.g., API key)
 * @param encryptionKey - The key to use for encryption (must be 32 bytes)
 * @returns The encrypted text in format: iv:authTag:encryptedData (all base64 encoded)
 */
export function encrypt(text: string, encryptionKey: string): string {
  // Validate encryption key
  if (!encryptionKey || Buffer.from(encryptionKey, 'hex').length !== KEY_LENGTH) {
    throw new Error('Invalid encryption key');
  }

  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher using the encryption key and iv
    const key = Buffer.from(encryptionKey, 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get the authentication tag
    const authTag = cipher.getAuthTag();
    
    // Return the encrypted data in the format: iv:authTag:encryptedData
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error; // Re-throw the original error
  }
}

/**
 * Decrypts a string that was encrypted using AES-256-GCM
 * @param encryptedText - The encrypted text in format: iv:authTag:encryptedData
 * @param encryptionKey - The key used for encryption (must be 32 bytes)
 * @returns The decrypted text
 */
export function decrypt(encryptedText: string, encryptionKey: string): string {
  // Validate encryption key
  if (!encryptionKey || Buffer.from(encryptionKey, 'hex').length !== KEY_LENGTH) {
    throw new Error('Invalid encryption key');
  }

  // Split the encrypted text into its components
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  try {
    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const encryptedData = parts[2];
    
    // Create decipher
    const key = Buffer.from(encryptionKey, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    // Set auth tag
    decipher.setAuthTag(authTag);
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error; // Re-throw the original error
  }
}

/**
 * Generates a random encryption key
 * @returns A random 32-byte key as a hex string
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Encrypts an API key using the environment variable as the encryption key
 * @param apiKey - The API key to encrypt
 * @returns The encrypted API key
 */
export async function encryptApiKey(apiKey: string): Promise<string> {
  // In a real application, this would use an environment variable
  // For testing purposes, we'll use a fixed key
  const encryptionKey = process.env.ENCRYPTION_KEY || 
    'd2e372921d15fe9312e6d45740ded074a019027122525ec390889154ba85d72f';
  
  return encrypt(apiKey, encryptionKey);
}

/**
 * Decrypts an API key using the environment variable as the encryption key
 * @param encryptedApiKey - The encrypted API key
 * @returns The decrypted API key
 */
export async function decryptApiKey(encryptedApiKey: string): Promise<string> {
  // In a real application, this would use an environment variable
  // For testing purposes, we'll use a fixed key
  const encryptionKey = process.env.ENCRYPTION_KEY || 
    'd2e372921d15fe9312e6d45740ded074a019027122525ec390889154ba85d72f';
  
  return decrypt(encryptedApiKey, encryptionKey);
} 