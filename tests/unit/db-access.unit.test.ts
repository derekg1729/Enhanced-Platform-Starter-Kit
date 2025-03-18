import { vi, describe, it, expect, beforeEach } from 'vitest';

// Create mock connections
const mockOpenAIConnection = {
  id: 'conn_123',
  name: 'OpenAI Connection',
  userId: 'user_123',
  service: 'openai',
  encryptedApiKey: 'encrypted_key_123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock the database module and its findFirst method
vi.mock('@/lib/db', () => {
  return {
    default: {
      query: {
        apiConnections: {
          findFirst: vi.fn()
        }
      }
    }
  };
});

// Import the function under test and the mocked database
import { getApiConnectionByService } from '@/lib/db-access';
import db from '@/lib/db';

describe('Database Access Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default behavior for findFirst to return a connection for valid calls
    vi.mocked(db.query.apiConnections.findFirst).mockResolvedValue(mockOpenAIConnection as any);
  });

  describe('getApiConnectionByService', () => {
    it('should return the API connection for a valid service and user', async () => {
      const result = await getApiConnectionByService('openai', 'user_123');
      expect(result).toEqual(mockOpenAIConnection);
      expect(db.query.apiConnections.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should return null if no API connection exists', async () => {
      // Override for this test to return null
      vi.mocked(db.query.apiConnections.findFirst).mockResolvedValueOnce(null as any);
      
      const result = await getApiConnectionByService('nonexistent', 'user_123');
      expect(result).toBeNull();
      expect(db.query.apiConnections.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the database query fails', async () => {
      // Override for this test to throw an error
      vi.mocked(db.query.apiConnections.findFirst).mockRejectedValueOnce(new Error('Database error'));
      
      await expect(getApiConnectionByService('openai', 'user_123'))
        .rejects.toThrow('Database error');
      expect(db.query.apiConnections.findFirst).toHaveBeenCalledTimes(1);
    });
  });
}); 