import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { sql } from '@vercel/postgres';
import { setCurrentUserForRLS, withRLS } from '../../lib/db-middleware';

// Mock next-auth/jwt
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

// Mock @vercel/postgres
vi.mock('@vercel/postgres', () => ({
  sql: vi.fn(),
}));

describe('Database Middleware', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock the sql template literal function to match the actual implementation
    (sql as any).mockImplementation((...args: unknown[]) => {
      return Promise.resolve({ rowCount: 1 });
    });
  });

  describe('setCurrentUserForRLS', () => {
    it('should set the current user ID when a user is authenticated', async () => {
      // Mock getToken to return a user
      (getToken as any).mockResolvedValue({ sub: 'test-user-id' });

      // Create mock request and response
      const req = {} as NextRequest;
      const res = { test: 'response' } as unknown as NextResponse;

      // Call the middleware
      const result = await setCurrentUserForRLS(req, res);

      // Verify that getToken was called with the request
      expect(getToken).toHaveBeenCalledWith({ req });

      // Verify that sql was called
      expect(sql).toHaveBeenCalled();

      // Verify that the middleware returns the response
      expect(result).toBe(res);
    });

    it('should set an empty user ID when no user is authenticated', async () => {
      // Mock getToken to return null
      (getToken as any).mockResolvedValue(null);

      // Create mock request and response
      const req = {} as NextRequest;
      const res = { test: 'response' } as unknown as NextResponse;

      // Call the middleware
      const result = await setCurrentUserForRLS(req, res);

      // Verify that getToken was called with the request
      expect(getToken).toHaveBeenCalledWith({ req });

      // Verify that sql was called
      expect(sql).toHaveBeenCalled();

      // Verify that the middleware returns the response
      expect(result).toBe(res);
    });

    it('should handle errors gracefully', async () => {
      // Mock getToken to throw an error
      (getToken as any).mockRejectedValue(new Error('Test error'));

      // Create mock request and response
      const req = {} as NextRequest;
      const res = { test: 'response' } as unknown as NextResponse;

      // Mock console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Call the middleware
      const result = await setCurrentUserForRLS(req, res);

      // Verify that the error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error setting current user for RLS:',
        expect.any(Error)
      );

      // Verify that the middleware returns the response
      expect(result).toBe(res);

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('withRLS', () => {
    it('should set the current user ID and execute the callback', async () => {
      // Create a mock callback
      const callback = vi.fn().mockResolvedValue('test-result');

      // Call the middleware
      const result = await withRLS('test-user-id', callback);

      // Verify that sql was called twice
      expect(sql).toHaveBeenCalledTimes(2);

      // Verify that the callback was called
      expect(callback).toHaveBeenCalledTimes(1);

      // Verify that the middleware returns the result of the callback
      expect(result).toBe('test-result');
    });

    it('should set an empty user ID when userId is null', async () => {
      // Create a mock callback
      const callback = vi.fn().mockResolvedValue('test-result');

      // Call the middleware
      const result = await withRLS(null, callback);

      // Verify that sql was called twice
      expect(sql).toHaveBeenCalledTimes(2);

      // Verify that the callback was called
      expect(callback).toHaveBeenCalledTimes(1);

      // Verify that the middleware returns the result of the callback
      expect(result).toBe('test-result');
    });

    it('should reset the user ID even if the callback throws an error', async () => {
      // Create a mock callback that throws an error
      const callback = vi.fn().mockRejectedValue(new Error('Test error'));

      // Call the middleware and expect it to throw
      await expect(withRLS('test-user-id', callback)).rejects.toThrow('Test error');

      // Verify that sql was called twice
      expect(sql).toHaveBeenCalledTimes(2);

      // Verify that the callback was called
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
}); 