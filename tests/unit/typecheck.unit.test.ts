import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('TypeScript Type Checking', () => {
  it('should not have any TypeScript errors', () => {
    try {
      // Run TypeScript compiler without emitting files to check for type errors
      const output = execSync('npx tsc --noEmit', { encoding: 'utf-8' });
      
      // If we get here, the command succeeded without errors
      expect(true).toBe(true);
    } catch (error: unknown) {
      // If TypeScript found errors, the command will fail and throw an error
      const errorOutput = error instanceof Error 
        ? (error as { stdout?: string, message: string }).stdout || error.message
        : String(error);
      
      // Log the errors for easier debugging
      console.error('TypeScript errors found:');
      console.error(errorOutput);
      
      // Fail the test
      expect(errorOutput).toBe('');
    }
  });
}); 