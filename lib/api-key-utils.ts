import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// Constants for encryption
const ALGORITHM = 'aes-256-gcm';
// Minimum length for the encryption key (32 bytes for AES-256)
const MIN_KEY_LENGTH = 32;

/**
 * Gets the encryption key from environment variables
 * Throws an error if the key is not set or is too short
 * 
 * @returns The encryption key
 */
export function getEncryptionKey(): string {
  const key = process.env.API_KEY_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('API_KEY_ENCRYPTION_KEY environment variable is not set');
  }
  
  if (key.length < MIN_KEY_LENGTH) {
    throw new Error(`API_KEY_ENCRYPTION_KEY must be at least ${MIN_KEY_LENGTH} characters long`);
  }
  
  return key;
}

/**
 * Encrypts an API key using AES-256-GCM
 * 
 * @param apiKey - The API key to encrypt
 * @returns The encrypted API key as a string in the format "iv:authTag:encryptedData"
 */
export function encryptApiKey(apiKey: string): string {
  try {
    // Get the encryption key
    const encryptionKey = getEncryptionKey();
    
    // Generate a random initialization vector
    const iv = randomBytes(16);
    
    // Create a cipher using the encryption key and IV
    const cipher = createCipheriv(
      ALGORITHM, 
      Buffer.from(encryptionKey).slice(0, 32), // Ensure key is exactly 32 bytes
      iv
    );
    
    // Encrypt the API key
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the authentication tag
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Return the IV, auth tag, and encrypted data as a colon-separated string
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Error encrypting API key:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * Decrypts an encrypted API key
 * 
 * @param encryptedData - The encrypted API key in the format "iv:authTag:encryptedData"
 * @returns The decrypted API key
 */
export function decryptApiKey(encryptedData: string): string {
  try {
    // Get the encryption key
    const encryptionKey = getEncryptionKey();
    
    // Split the encrypted data into its components
    const [ivHex, authTagHex, encryptedHex] = encryptedData.split(':');
    
    if (!ivHex || !authTagHex || !encryptedHex) {
      throw new Error('Invalid encrypted data format');
    }
    
    // Convert hex strings back to buffers
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    
    // Create a decipher
    const decipher = createDecipheriv(
      ALGORITHM, 
      Buffer.from(encryptionKey).slice(0, 32), // Ensure key is exactly 32 bytes
      iv
    );
    
    // Set the auth tag
    decipher.setAuthTag(authTag);
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    if ((error as Error).message === 'Invalid encrypted data format') {
      throw error;
    }
    console.error('Error decrypting API key:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Validates that a string is in the correct encrypted format
 * 
 * @param encryptedData - The string to validate
 * @returns True if the string is in the correct format, false otherwise
 */
export function isValidEncryptedFormat(encryptedData: string): boolean {
  const parts = encryptedData.split(':');
  return parts.length === 3 && 
    /^[0-9a-f]+$/.test(parts[0]) && 
    /^[0-9a-f]+$/.test(parts[1]) && 
    /^[0-9a-f]+$/.test(parts[2]);
}

/**
 * Safely decrypts an API key, returning null if the format is invalid
 * 
 * @param encryptedData - The encrypted API key
 * @returns The decrypted API key or null if the format is invalid
 */
export function safeDecryptApiKey(encryptedData: string): string | null {
  try {
    if (!isValidEncryptedFormat(encryptedData)) {
      return null;
    }
    return decryptApiKey(encryptedData);
  } catch (error) {
    console.error('Error decrypting API key:', error);
    return null;
  }
} 