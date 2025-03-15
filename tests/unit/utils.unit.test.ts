import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  cn, 
  fetcher, 
  capitalize, 
  truncate, 
  toDateString, 
  random, 
  withLimit,
  stripUndefined
} from '@/lib/utils';

// Mock fetch for the fetcher tests
vi.mock('global', () => ({
  fetch: vi.fn()
}));

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      expect(cn('base-class', isActive && 'active-class')).toBe('base-class active-class');
    });

    it('should handle falsy values', () => {
      expect(cn('base-class', false && 'hidden', null, undefined, 0)).toBe('base-class');
    });

    it('should handle tailwind class conflicts correctly', () => {
      // The second class should override the first for the same property
      expect(cn('text-sm', 'text-lg')).toBe('text-lg');
      expect(cn('p-4', 'px-6')).toBe('p-4 px-6');
    });
  });

  describe('fetcher', () => {
    beforeEach(() => {
      vi.resetAllMocks();
      
      // Setup fetch mock
      global.fetch = vi.fn();
    });

    it('should call fetch with the correct parameters', async () => {
      const mockResponse = { json: vi.fn().mockResolvedValue({ data: 'test' }) };
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as any);

      const url = 'https://example.com/api';
      const options = { method: 'POST', body: JSON.stringify({ test: true }) };
      
      await fetcher(url, options);
      
      expect(global.fetch).toHaveBeenCalledWith(url, { 
        ...options, 
        cache: 'no-store' 
      });
    });

    it('should return the JSON response', async () => {
      const mockData = { data: 'test' };
      const mockResponse = { json: vi.fn().mockResolvedValue(mockData) };
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as any);

      const result = await fetcher('https://example.com/api');
      
      expect(result).toEqual(mockData);
    });

    it('should throw an error when fetch fails', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      await expect(fetcher('https://example.com/api')).rejects.toThrow('Network error');
    });
  });

  describe('capitalize', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle already capitalized strings', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('should handle single character strings', () => {
      expect(capitalize('a')).toBe('A');
    });

    it('should return empty string for non-string inputs', () => {
      // @ts-ignore - Testing runtime behavior with invalid input
      expect(capitalize(null)).toBe('');
      // @ts-ignore - Testing runtime behavior with invalid input
      expect(capitalize(undefined)).toBe('');
      // @ts-ignore - Testing runtime behavior with invalid input
      expect(capitalize(123)).toBe('');
    });
  });

  describe('truncate', () => {
    it('should truncate strings longer than the specified length', () => {
      expect(truncate('Hello world', 5)).toBe('Hello...');
    });

    it('should not truncate strings shorter than the specified length', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });

    it('should handle empty strings', () => {
      expect(truncate('', 5)).toBe('');
    });

    it('should handle strings equal to the specified length', () => {
      expect(truncate('Hello', 5)).toBe('Hello');
    });

    it('should handle null or undefined inputs', () => {
      // @ts-ignore - Testing runtime behavior with invalid input
      expect(truncate(null, 5)).toBe('');
      // @ts-ignore - Testing runtime behavior with invalid input
      expect(truncate(undefined, 5)).toBe('');
    });
  });

  describe('toDateString', () => {
    it('should format a date correctly', () => {
      const date = new Date('2023-01-15T12:00:00Z');
      // This will depend on the locale of the test runner, so we'll check for expected format
      expect(toDateString(date)).toMatch(/Jan 1[45], 2023/); // Account for timezone differences
    });

    it('should handle different date inputs', () => {
      // Create a date with a specific timezone to avoid test failures due to timezone differences
      const date = new Date('2023-05-20T12:00:00Z');
      // Use a regex that accounts for potential timezone differences
      expect(toDateString(date)).toMatch(/May (19|20), 2023/);
    });
  });

  describe('random', () => {
    it('should return a number within the specified range', () => {
      const min = 1;
      const max = 10;
      
      // Run multiple times to ensure it works consistently
      for (let i = 0; i < 100; i++) {
        const result = random(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
      }
    });

    it('should handle min equal to max', () => {
      expect(random(5, 5)).toBe(5);
    });

    it('should handle negative numbers', () => {
      const min = -10;
      const max = -5;
      
      const result = random(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    });
  });

  describe('withLimit', () => {
    it('should add a limit to a query builder', () => {
      const mockQueryBuilder = {
        limit: vi.fn().mockReturnThis(),
      };
      
      // @ts-ignore - Mocking the query builder
      const result = withLimit(mockQueryBuilder, 10);
      
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
      expect(result).toBe(mockQueryBuilder);
    });
  });

  describe('stripUndefined', () => {
    it('should remove undefined properties from an object', () => {
      const obj = {
        a: 1,
        b: undefined,
        c: 'test',
        d: null,
        e: undefined,
      };
      
      const result = stripUndefined(obj);
      
      expect(result).toEqual({
        a: 1,
        c: 'test',
        d: null,
      });
    });

    it('should handle empty objects', () => {
      expect(stripUndefined({})).toEqual({});
    });

    it('should handle objects with no undefined values', () => {
      const obj = { a: 1, b: 'test', c: null };
      expect(stripUndefined(obj)).toEqual(obj);
    });

    it('should handle objects with only undefined values', () => {
      const obj = { a: undefined, b: undefined };
      expect(stripUndefined(obj)).toEqual({});
    });
  });
}); 