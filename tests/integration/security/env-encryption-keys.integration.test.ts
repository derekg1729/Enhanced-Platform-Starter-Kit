import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Minimum length for the encryption key (32 bytes for AES-256)
const MIN_KEY_LENGTH = 32;

// Environment files to check
const ENV_FILES = [
  '.env.example',
  '.env.local.example',
  '.env.preview.example',
  '.env.production.example',
  '.env.test'
];

// Actual environment files (these may contain sensitive data, so we'll just check existence)
const ACTUAL_ENV_FILES = [
  '.env.local',
  '.env.preview',
  '.env.production'
];

describe('API Key Encryption Environment Variables', () => {
  // Test that example environment files have valid encryption keys
  it('should have valid API_KEY_ENCRYPTION_KEY in all example environment files', () => {
    for (const file of ENV_FILES) {
      const filePath = path.join(process.cwd(), file);
      
      // Check if the file exists
      expect(fs.existsSync(filePath), `${file} should exist`).toBe(true);
      
      // Parse the environment file
      const env = dotenv.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Check if API_KEY_ENCRYPTION_KEY exists
      expect(env.API_KEY_ENCRYPTION_KEY, `${file} should have API_KEY_ENCRYPTION_KEY`).toBeDefined();
      
      // Check if the key meets the minimum length requirement
      expect(env.API_KEY_ENCRYPTION_KEY.length, `${file} should have API_KEY_ENCRYPTION_KEY with at least ${MIN_KEY_LENGTH} characters`).toBeGreaterThanOrEqual(MIN_KEY_LENGTH);
      
      // Check that the key is not the default test key (except for .env.test)
      if (file !== '.env.test') {
        expect(env.API_KEY_ENCRYPTION_KEY, `${file} should not use the default test key`).not.toBe('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');
      }
      
      // Check that each key is unique
      for (const otherFile of ENV_FILES) {
        if (file !== otherFile) {
          const otherFilePath = path.join(process.cwd(), otherFile);
          if (fs.existsSync(otherFilePath)) {
            const otherEnv = dotenv.parse(fs.readFileSync(otherFilePath, 'utf8'));
            if (otherEnv.API_KEY_ENCRYPTION_KEY) {
              expect(env.API_KEY_ENCRYPTION_KEY, `${file} should have a different key than ${otherFile}`).not.toBe(otherEnv.API_KEY_ENCRYPTION_KEY);
            }
          }
        }
      }
    }
  });
  
  // Test that actual environment files exist (without reading their contents)
  it('should have actual environment files with API_KEY_ENCRYPTION_KEY', () => {
    for (const file of ACTUAL_ENV_FILES) {
      const filePath = path.join(process.cwd(), file);
      
      // Check if the file exists
      expect(fs.existsSync(filePath), `${file} should exist`).toBe(true);
      
      // Check if the file contains API_KEY_ENCRYPTION_KEY
      const fileContent = fs.readFileSync(filePath, 'utf8');
      expect(fileContent.includes('API_KEY_ENCRYPTION_KEY='), `${file} should contain API_KEY_ENCRYPTION_KEY`).toBe(true);
    }
  });
  
  // Test that the test setup file sets the API_KEY_ENCRYPTION_KEY environment variable
  it('should set API_KEY_ENCRYPTION_KEY in test setup', () => {
    const setupFilePath = path.join(process.cwd(), 'tests/__helpers__/setup.ts');
    
    // Check if the file exists
    expect(fs.existsSync(setupFilePath), 'tests/__helpers__/setup.ts should exist').toBe(true);
    
    // Check if the file sets API_KEY_ENCRYPTION_KEY
    const setupContent = fs.readFileSync(setupFilePath, 'utf8');
    expect(setupContent.includes('process.env.API_KEY_ENCRYPTION_KEY ='), 'test setup should set API_KEY_ENCRYPTION_KEY').toBe(true);
  });
  
  // Test that the API_KEY_ENCRYPTION_KEY is added to the environment consistency check
  it('should include API_KEY_ENCRYPTION_KEY in environment consistency check', () => {
    const checkEnvFilePath = path.join(process.cwd(), 'scripts/check-env-consistency.js');
    
    // Check if the file exists
    expect(fs.existsSync(checkEnvFilePath), 'scripts/check-env-consistency.js should exist').toBe(true);
    
    // Check if the file includes API_KEY_ENCRYPTION_KEY in the required variables
    const checkEnvContent = fs.readFileSync(checkEnvFilePath, 'utf8');
    
    // This test might fail if API_KEY_ENCRYPTION_KEY is not yet added to the required variables
    // If it fails, we'll need to update the check-env-consistency.js file
    expect(checkEnvContent.includes('API_KEY_ENCRYPTION_KEY'), 'environment consistency check should include API_KEY_ENCRYPTION_KEY').toBe(true);
  });
}); 