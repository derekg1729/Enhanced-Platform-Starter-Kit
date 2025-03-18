import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiConnection, getApiConnections, deleteApiConnection } from '@/lib/actions';
import { eq, and } from 'drizzle-orm';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  default: {
    query: {
      apiConnections: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      }
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
  }
}));

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
  withSiteAuth: vi.fn((action) => action),
  withPostAuth: vi.fn((action) => action),
}));

vi.mock('@/lib/encryption', () => ({
  encryptApiKey: vi.fn().mockResolvedValue('encrypted-api-key'),
}));

// Import mocks after they've been defined
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { encryptApiKey } from '@/lib/encryption';

describe('API Connection Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue({
      user: { 
        id: 'user-123',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        image: 'https://example.com/avatar.png'
      }
    });
  });

  describe('createApiConnection', () => {
    it('should create a new API connection when one does not exist', async () => {
      // Mock form data
      const formData = new FormData();
      formData.append('service', 'openai');
      formData.append('apiKey', 'sk-test123');
      formData.append('name', 'My OpenAI Key');

      // Mock database responses
      vi.mocked(db.query.apiConnections.findFirst).mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'conn-123',
            service: 'openai',
            name: 'My OpenAI Key',
            userId: 'user-123',
            createdAt: new Date(),
            updatedAt: new Date(),
          }]),
        }),
      } as any);

      const result = await createApiConnection(formData);

      // Verify encryption was called
      expect(encryptApiKey).toHaveBeenCalledWith('sk-test123');

      // Verify database operations
      expect(db.query.apiConnections.findFirst).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalled();

      // Verify result
      expect(result).toEqual(expect.objectContaining({
        id: 'conn-123',
        service: 'openai',
        name: 'My OpenAI Key',
      }));
    });

    it('should update an existing API connection when one exists', async () => {
      // Mock form data
      const formData = new FormData();
      formData.append('service', 'openai');
      formData.append('apiKey', 'sk-test123');
      formData.append('name', 'Updated OpenAI Key');

      // Mock database responses
      vi.mocked(db.query.apiConnections.findFirst).mockResolvedValue({
        id: 'conn-123',
        service: 'openai',
        encryptedApiKey: 'old-encrypted-key',
        name: 'My OpenAI Key',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{
              id: 'conn-123',
              service: 'openai',
              name: 'Updated OpenAI Key',
              userId: 'user-123',
              createdAt: new Date(),
              updatedAt: new Date(),
            }]),
          }),
        }),
      } as any);

      const result = await createApiConnection(formData);

      // Verify encryption was called
      expect(encryptApiKey).toHaveBeenCalledWith('sk-test123');

      // Verify database operations
      expect(db.query.apiConnections.findFirst).toHaveBeenCalled();
      expect(db.update).toHaveBeenCalled();

      // Verify result
      expect(result).toEqual(expect.objectContaining({
        id: 'conn-123',
        service: 'openai',
        name: 'Updated OpenAI Key',
      }));
    });

    it('should return an error if not authenticated', async () => {
      // Mock unauthenticated session
      vi.mocked(getSession).mockResolvedValue(null);

      // Mock form data
      const formData = new FormData();
      formData.append('service', 'openai');
      formData.append('apiKey', 'sk-test123');

      const result = await createApiConnection(formData);

      // Verify result contains error
      expect(result).toEqual({
        error: 'Not authenticated',
      });
    });

    it('should return an error if service or API key is missing', async () => {
      // Mock form data with missing fields
      const formData = new FormData();
      // Missing service and apiKey

      const result = await createApiConnection(formData);

      // Verify result contains error
      expect(result).toEqual({
        error: 'Service and API key are required',
      });
    });

    it('should handle database errors gracefully', async () => {
      // Mock form data
      const formData = new FormData();
      formData.append('service', 'openai');
      formData.append('apiKey', 'sk-test123');

      // Mock database error
      vi.mocked(db.query.apiConnections.findFirst).mockRejectedValue(new Error('Database error'));

      const result = await createApiConnection(formData);

      // Verify result contains error
      expect(result).toEqual({
        error: 'Database error',
      });
    });
  });

  describe('getApiConnections', () => {
    it('should return API connections for the authenticated user', async () => {
      // Mock database response
      const mockConnections = [
        {
          id: 'conn-1',
          service: 'openai',
          encryptedApiKey: 'encrypted-key-1',
          name: 'OpenAI Key',
          userId: 'user-123',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
        {
          id: 'conn-2',
          service: 'anthropic',
          encryptedApiKey: 'encrypted-key-2',
          name: 'Anthropic Key',
          userId: 'user-123',
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02'),
        },
      ];

      vi.mocked(db.query.apiConnections.findMany).mockResolvedValue(mockConnections);

      const result = await getApiConnections();

      // Verify database query
      expect(db.query.apiConnections.findMany).toHaveBeenCalled();

      // Verify result format (should not include encrypted keys)
      expect(result).toEqual([
        {
          id: 'conn-1',
          service: 'openai',
          name: 'OpenAI Key',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          hasKey: true,
        },
        {
          id: 'conn-2',
          service: 'anthropic',
          name: 'Anthropic Key',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          hasKey: true,
        },
      ]);
    });

    it('should return an empty array if not authenticated', async () => {
      // Mock unauthenticated session
      vi.mocked(getSession).mockResolvedValue(null);

      const result = await getApiConnections();

      // Verify result is empty array
      expect(result).toEqual([]);
    });

    it('should return an empty array if no connections found', async () => {
      // Mock empty database response
      vi.mocked(db.query.apiConnections.findMany).mockResolvedValue([]);

      const result = await getApiConnections();

      // Verify result is empty array
      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      vi.mocked(db.query.apiConnections.findMany).mockRejectedValue(new Error('Database error'));

      const result = await getApiConnections();

      // Verify result is empty array
      expect(result).toEqual([]);
    });
  });

  describe('deleteApiConnection', () => {
    it('should delete an API connection and return success', async () => {
      // Mock connection exists
      vi.mocked(db.query.apiConnections.findFirst).mockResolvedValue({
        id: 'conn-123',
        service: 'openai',
        name: 'Test API Key',
        encryptedApiKey: 'encrypted-key',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await deleteApiConnection('conn-123');

      // Verify database operations
      expect(db.query.apiConnections.findFirst).toHaveBeenCalled();
      expect(db.delete).toHaveBeenCalled();

      // Verify result
      expect(result).toEqual({ success: true });
    });

    it('should return an error if not authenticated', async () => {
      // Mock unauthenticated session
      vi.mocked(getSession).mockResolvedValue(null);

      const result = await deleteApiConnection('conn-123');

      // Verify result contains error
      expect(result).toEqual({
        error: 'Not authenticated',
      });
    });

    it('should return an error if connection not found', async () => {
      // Mock connection not found
      vi.mocked(db.query.apiConnections.findFirst).mockResolvedValue(undefined);

      const result = await deleteApiConnection('conn-123');

      // Verify result contains error
      expect(result).toEqual({
        error: "API connection not found or you don't have permission to delete it",
      });
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      vi.mocked(db.query.apiConnections.findFirst).mockRejectedValue(new Error('Database error'));

      const result = await deleteApiConnection('conn-123');

      // Verify result contains error
      expect(result).toEqual({
        error: 'Failed to delete API connection',
      });
    });
  });
}); 