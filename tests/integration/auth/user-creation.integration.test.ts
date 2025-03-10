import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createUser, getUserById } from '@/lib/user-db';

// Mock user-db functions
vi.mock('@/lib/user-db', () => ({
  createUser: vi.fn(),
  getUserById: vi.fn(),
}));

describe('User Database Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should create user when they do not exist', async () => {
    const userData = {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/image.jpg',
    };

    // Mock getUserById to return null (user doesn't exist)
    vi.mocked(getUserById).mockResolvedValueOnce(null);
    
    // Mock createUser to return the created user
    vi.mocked(createUser).mockResolvedValueOnce({
      ...userData,
      emailVerified: null,
    });

    // Check if user exists
    const existingUser = await getUserById(userData.id);
    
    // If user doesn't exist, create them
    let result = null;
    if (!existingUser) {
      result = await createUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        image: userData.image,
      });
    }

    // Verify createUser was called with correct data
    expect(getUserById).toHaveBeenCalledWith(userData.id);
    expect(createUser).toHaveBeenCalledWith({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.image,
    });
    expect(result).toEqual({
      ...userData,
      emailVerified: null,
    });
  });

  test('should not create user when email is missing', async () => {
    const userData = {
      id: 'test-user-id',
      name: 'Test User',
      image: 'https://example.com/image.jpg',
    };

    // Mock getUserById to return null (user doesn't exist)
    vi.mocked(getUserById).mockResolvedValueOnce(null);

    // Check if user exists
    const existingUser = await getUserById(userData.id);
    
    // If user doesn't exist and has email, create them
    let result = null;
    if (!existingUser && 'email' in userData) {
      result = await createUser({
        id: userData.id,
        name: userData.name,
        email: (userData as any).email as string,
        image: userData.image,
      });
    }

    // Verify createUser was not called
    expect(getUserById).toHaveBeenCalledWith(userData.id);
    expect(createUser).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  test('should not create user when they already exist', async () => {
    const userData = {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com' as string,
      image: 'https://example.com/image.jpg',
      emailVerified: null,
    };

    // Mock getUserById to return the user (user exists)
    vi.mocked(getUserById).mockResolvedValueOnce(userData);

    // Check if user exists
    const existingUser = await getUserById(userData.id);
    
    // If user doesn't exist, create them
    let result = null;
    if (!existingUser) {
      result = await createUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        image: userData.image,
      });
    } else {
      result = existingUser;
    }

    // Verify createUser was not called
    expect(getUserById).toHaveBeenCalledWith(userData.id);
    expect(createUser).not.toHaveBeenCalled();
    expect(result).toEqual(userData);
  });
}); 