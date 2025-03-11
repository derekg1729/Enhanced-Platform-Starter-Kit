import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { GET as getApiServices } from '../../../app/api/api-connections/services/route';

// Mock the next-auth getServerSession function
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock data
const mockUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
};

// Define a type for the API service
interface ApiService {
  id: string;
  name: string;
  description: string;
  url: string;
  models: string[];
  keyFormat: RegExp;
  keyName: string;
  keyInstructions: string;
}

describe('API Services API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/api-connections/services', () => {
    it('should return a list of supported API services', async () => {
      // Mock the session
      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/api-connections/services', {
        method: 'GET',
      });

      // Call the API route
      const response = await getApiServices(req);

      // Check the response
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      
      // Check that each service has the required properties
      data.forEach((service: Partial<ApiService>) => {
        expect(service).toHaveProperty('id');
        expect(service).toHaveProperty('name');
        expect(service).toHaveProperty('description');
      });
    });

    it('should return 401 if the user is not authenticated', async () => {
      // Mock the session (no user)
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create a mock request
      const req = new NextRequest('http://localhost:3000/api/api-connections/services', {
        method: 'GET',
      });

      // Call the API route
      const response = await getApiServices(req);

      // Check the response
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: 'Unauthorized' });
    });
  });
}); 