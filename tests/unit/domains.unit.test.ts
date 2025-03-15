import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  addDomainToVercel,
  removeDomainFromVercelProject,
  removeDomainFromVercelTeam,
  getDomainResponse,
  getConfigResponse,
  verifyDomain,
  getSubdomain,
  getApexDomain,
  validDomainRegex
} from '@/lib/domains';

// Mock environment variables directly
const originalEnv = process.env;

describe('Domain Utilities', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Restore and set environment variables for each test
    process.env = {
      ...originalEnv,
      PROJECT_ID_VERCEL: 'test-project-id',
      TEAM_ID_VERCEL: 'test-team-id',
      AUTH_BEARER_TOKEN: 'test-token',
      NEXT_PUBLIC_ROOT_DOMAIN: 'localhost:3000'
    };
    
    // Mock fetch globally
    global.fetch = vi.fn(() => 
      Promise.resolve({
        json: () => Promise.resolve({ success: true })
      })
    ) as any;
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('addDomainToVercel', () => {
    it('should call the Vercel API with the correct parameters', async () => {
      const domain = 'test.com';
      
      await addDomainToVercel(domain);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`https://api.vercel.com/v10/projects/test-project-id/domains`),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: domain }),
        })
      );
    });

    it('should return the JSON response', async () => {
      const mockData = { name: 'test.com', verified: true };
      global.fetch = vi.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve(mockData)
        })
      ) as any;

      const result = await addDomainToVercel('test.com');
      
      expect(result).toEqual(mockData);
    });
  });

  describe('removeDomainFromVercelProject', () => {
    it('should call the Vercel API with the correct parameters', async () => {
      const domain = 'test.com';
      
      await removeDomainFromVercelProject(domain);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`https://api.vercel.com/v9/projects/test-project-id/domains/${domain}`),
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer test-token',
          },
        })
      );
    });

    it('should return the JSON response', async () => {
      const mockData = { success: true };
      global.fetch = vi.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve(mockData)
        })
      ) as any;

      const result = await removeDomainFromVercelProject('test.com');
      
      expect(result).toEqual(mockData);
    });
  });

  describe('removeDomainFromVercelTeam', () => {
    it('should call the Vercel API with the correct parameters', async () => {
      const domain = 'test.com';
      
      await removeDomainFromVercelTeam(domain);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`https://api.vercel.com/v6/domains/${domain}`),
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer test-token',
          },
        })
      );
    });

    it('should return the JSON response', async () => {
      const mockData = { success: true };
      global.fetch = vi.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve(mockData)
        })
      ) as any;

      const result = await removeDomainFromVercelTeam('test.com');
      
      expect(result).toEqual(mockData);
    });
  });

  describe('getDomainResponse', () => {
    it('should call the Vercel API with the correct parameters', async () => {
      const domain = 'test.com';
      
      await getDomainResponse(domain);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`https://api.vercel.com/v9/projects/test-project-id/domains/${domain}`),
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should return the JSON response', async () => {
      const mockData = { name: 'test.com', verified: true };
      global.fetch = vi.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve(mockData)
        })
      ) as any;

      const result = await getDomainResponse('test.com');
      
      expect(result).toEqual(mockData);
    });
  });

  describe('getConfigResponse', () => {
    it('should call the Vercel API with the correct parameters', async () => {
      const domain = 'test.com';
      
      await getConfigResponse(domain);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`https://api.vercel.com/v6/domains/${domain}/config`),
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should return the JSON response', async () => {
      const mockData = { 
        name: 'test.com', 
        apexName: 'test.com',
        projectId: 'test-project-id',
        redirect: null,
        redirectStatusCode: null,
        gitBranch: null,
        updatedAt: 1616161616161
      };
      global.fetch = vi.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve(mockData)
        })
      ) as any;

      const result = await getConfigResponse('test.com');
      
      expect(result).toEqual(mockData);
    });
  });

  describe('verifyDomain', () => {
    it('should call the Vercel API with the correct parameters', async () => {
      const domain = 'test.com';
      
      await verifyDomain(domain);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`https://api.vercel.com/v9/projects/test-project-id/domains/${domain}/verify`),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should return the JSON response', async () => {
      const mockData = { name: 'test.com', verified: true };
      global.fetch = vi.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve(mockData)
        })
      ) as any;

      const result = await verifyDomain('test.com');
      
      expect(result).toEqual(mockData);
    });
  });

  describe('getSubdomain', () => {
    it('should return null if name equals apexName', () => {
      expect(getSubdomain('example.com', 'example.com')).toBeNull();
    });

    it('should return the subdomain part', () => {
      expect(getSubdomain('sub.example.com', 'example.com')).toBe('sub');
    });
  });

  describe('getApexDomain', () => {
    it('should return empty string for invalid URLs', () => {
      expect(getApexDomain('not-a-url')).toBe('');
    });

    it('should return the domain for a normal domain', () => {
      expect(getApexDomain('http://example.com')).toBe('example.com');
    });

    it('should return the last two parts for a subdomain', () => {
      expect(getApexDomain('http://sub.example.com')).toBe('example.com');
    });
  });

  describe('validDomainRegex', () => {
    it('should match valid domains', () => {
      expect(validDomainRegex.test('example.com')).toBe(true);
      expect(validDomainRegex.test('sub.example.com')).toBe(true);
      expect(validDomainRegex.test('sub-domain.example.com')).toBe(true);
    });

    it('should not match invalid domains', () => {
      expect(validDomainRegex.test('example')).toBe(false);
      expect(validDomainRegex.test('example.')).toBe(false);
      expect(validDomainRegex.test('.com')).toBe(false);
      expect(validDomainRegex.test('example..com')).toBe(false);
    });
  });
}); 