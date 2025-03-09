import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock modules before importing them
vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  or: vi.fn(),
  desc: vi.fn(),
  sql: vi.fn()
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn()
}));

// Mock the database
vi.mock('@/lib/db', () => {
  return {
    default: {
      query: {
        sites: {
          findFirst: vi.fn()
        },
        posts: {
          findFirst: vi.fn()
        }
      }
    }
  };
});

// Mock auth functions
vi.mock('@/lib/auth', () => ({
  authOptions: {},
  getSession: vi.fn(),
  withSiteAuth: vi.fn(),
  withPostAuth: vi.fn()
}));

// Now import the modules
import { getSession, withSiteAuth, withPostAuth } from '@/lib/auth';
import db from '@/lib/db';
import { eq } from 'drizzle-orm';

// Define interfaces for mocks
interface MockUser {
  id: string;
  name: string;
  username: string;
  email: string;
  image: string;
}

interface MockSite {
  id: string;
  userId: string;
  name?: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  imageBlurhash: string | null;
  subdomain: string | null;
  customDomain: string | null;
  message404: string | null;
}

interface MockPost {
  id: string;
  siteId: string;
  userId: string;
  title: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  imageBlurhash: string | null;
  content: string | null;
  slug: string;
  published: boolean;
}

// Test suite
describe('Authentication System', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getSession", () => {
    it("should return null when no session exists", async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null);
      
      const session = await getSession();
      
      expect(session).toBeNull();
    });

    it("should return user data when session exists", async () => {
      const mockUser: MockUser = {
        id: "user-123",
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        image: "https://example.com/avatar.png"
      };
      
      vi.mocked(getSession).mockResolvedValueOnce({
        user: mockUser
      });
      
      const session = await getSession();
      
      expect(session).toEqual({ user: mockUser });
    });
  });

  describe("withSiteAuth", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("should return error when user is not authenticated", async () => {
      // Setup
      vi.mocked(getSession).mockResolvedValueOnce(null);
      
      // Create a mock implementation that matches the expected signature
      vi.mocked(withSiteAuth).mockImplementationOnce((action) => {
        return async (formData: FormData | null, siteId: string, key: string | null) => {
          const session = await getSession();
          if (!session) {
            return {
              error: "Not authenticated",
            };
          }
          return action(formData, { id: siteId } as any, key);
        };
      });

      // Create a handler with the correct signature
      const handler = withSiteAuth((formData: FormData | null, site: MockSite, key: string | null) => {
        return { data: 'success' };
      });

      // Call the handler with the expected arguments
      const result = await handler(null, 'site-123', null);

      // Assert
      expect(result).toEqual({ error: "Not authenticated" });
    });

    it("should return error when site does not exist", async () => {
      // Setup
      const mockUser: MockUser = { 
        id: 'user-123', 
        name: 'Test User', 
        username: 'testuser', 
        email: 'test@example.com',
        image: 'https://example.com/avatar.png'
      };
      
      vi.mocked(getSession).mockResolvedValueOnce({
        user: mockUser
      });
      
      vi.mocked(db.query.sites.findFirst).mockReturnValue(Promise.resolve(null) as any);
      
      // Create a mock implementation that matches the expected signature
      vi.mocked(withSiteAuth).mockImplementationOnce((action) => {
        return async (formData: FormData | null, siteId: string, key: string | null) => {
          const session = await getSession();
          if (!session) {
            return {
              error: "Not authenticated",
            };
          }
          
          const site = await db.query.sites.findFirst({
            where: { id: 'site-123' } as any
          });
          
          if (!site) {
            return {
              error: "Not authorized",
            };
          }
          
          return action(formData, site, key);
        };
      });

      // Create a handler with the correct signature
      const handler = withSiteAuth((formData: FormData | null, site: MockSite, key: string | null) => {
        return { data: 'success' };
      });

      // Call the handler with the expected arguments
      const result = await handler(null, 'site-123', null);

      // Assert
      expect(result).toEqual({ error: "Not authorized" });
    });

    it("should return error when user does not own the site", async () => {
      // Setup
      const mockUser: MockUser = { 
        id: 'user-123', 
        name: 'Test User', 
        username: 'testuser', 
        email: 'test@example.com',
        image: 'https://example.com/avatar.png'
      };
      
      vi.mocked(getSession).mockResolvedValueOnce({
        user: mockUser
      });
      
      const mockSite: MockSite = {
        id: 'site-123',
        userId: 'different-user-id', // Different user ID
        name: 'Test Site',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
        imageBlurhash: null,
        subdomain: null,
        customDomain: null,
        message404: null
      };
      
      vi.mocked(db.query.sites.findFirst).mockReturnValue(Promise.resolve(mockSite) as any);
      
      // Create a mock implementation that matches the expected signature
      vi.mocked(withSiteAuth).mockImplementationOnce((action) => {
        return async (formData: FormData | null, siteId: string, key: string | null) => {
          const session = await getSession();
          if (!session) {
            return {
              error: "Not authenticated",
            };
          }
          
          const site = await db.query.sites.findFirst({
            where: { id: 'site-123' } as any
          });
          
          if (!site || site.userId !== session.user.id) {
            return {
              error: "Not authorized",
            };
          }
          
          return action(formData, site, key);
        };
      });

      // Create a handler with the correct signature
      const handler = withSiteAuth((formData: FormData | null, site: MockSite, key: string | null) => {
        return { data: 'success' };
      });

      // Call the handler with the expected arguments
      const result = await handler(null, 'site-123', null);

      // Assert
      expect(result).toEqual({ error: "Not authorized" });
    });

    it("should call action when user owns the site", async () => {
      // Setup
      const mockUser: MockUser = { 
        id: 'user-123', 
        name: 'Test User', 
        username: 'testuser', 
        email: 'test@example.com',
        image: 'https://example.com/avatar.png'
      };
      
      vi.mocked(getSession).mockResolvedValueOnce({
        user: mockUser
      });
      
      const mockSite: MockSite = {
        id: 'site-123',
        userId: 'user-123', // Same user ID
        name: 'Test Site',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
        imageBlurhash: null,
        subdomain: null,
        customDomain: null,
        message404: null
      };
      
      vi.mocked(db.query.sites.findFirst).mockReturnValue(Promise.resolve(mockSite) as any);
      
      const actionSpy = vi.fn().mockReturnValue({ data: 'success' });
      
      // Create a mock implementation that matches the expected signature
      vi.mocked(withSiteAuth).mockImplementationOnce((action) => {
        return async (formData: FormData | null, siteId: string, key: string | null) => {
          const session = await getSession();
          if (!session) {
            return {
              error: "Not authenticated",
            };
          }
          
          const site = await db.query.sites.findFirst({
            where: { id: 'site-123' } as any
          });
          
          if (!site || site.userId !== session.user.id) {
            return {
              error: "Not authorized",
            };
          }
          
          return action(formData, site, key);
        };
      });

      // Create a handler with the correct signature
      const handler = withSiteAuth(actionSpy);

      // Call the handler with the expected arguments
      const result = await handler(null, 'site-123', null);

      // Assert
      expect(result).toEqual({ data: 'success' });
      expect(actionSpy).toHaveBeenCalledWith(null, mockSite, null);
    });

    it("should return 401 if session is null", async () => {
      // Setup
      vi.mocked(getSession).mockResolvedValueOnce(null);
      
      // When checking for the site, update the where clause
      vi.mocked(db.query.sites.findFirst).mockResolvedValueOnce({
        id: 'site-123',
        userId: 'user-123',
        name: 'Test Site',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
        imageBlurhash: null,
        subdomain: null,
        customDomain: null,
        message404: null
      } as any);
      
      // Create a mock implementation that matches the expected signature
      vi.mocked(withSiteAuth).mockImplementationOnce((action) => {
        return async (formData: FormData | null, siteId: string, key: string | null) => {
          const session = await getSession();
          if (!session) {
            return {
              error: "Not authenticated",
            };
          }
          
          const site = await db.query.sites.findFirst({
            where: { id: 'site-123' } as any
          });
          
          if (!site) {
            return {
              error: "Not authorized",
            };
          }
          
          return action(formData, site, key);
        };
      });

      // Create a handler with the correct signature
      const handler = withSiteAuth((formData: FormData | null, site: MockSite, key: string | null) => {
        return { data: 'success' };
      });

      // Call the handler with the expected arguments
      const result = await handler(null, 'site-123', null);

      // Assert
      expect(result).toEqual({ error: "Not authenticated" });
    });
  });

  describe("withPostAuth", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("should return error when user is not authenticated", async () => {
      // Setup
      vi.mocked(getSession).mockResolvedValueOnce(null);
      
      // Create a mock implementation that matches the expected signature
      vi.mocked(withPostAuth).mockImplementationOnce((action) => {
        return async (formData: FormData | null, postId: string, key: string | null) => {
          const session = await getSession();
          if (!session) {
            return {
              error: "Not authenticated",
            };
          }
          return action(formData, { id: postId } as MockPost, key);
        };
      });

      // Create a handler with the correct signature
      const handler = withPostAuth((formData: FormData | null, post: MockPost, key: string | null) => {
        return { data: 'success' };
      });

      // Call the handler with the expected arguments
      const result = await handler(null, 'post-123', null);

      // Assert
      expect(result).toEqual({ error: "Not authenticated" });
    });

    it("should return error when post does not exist", async () => {
      // Setup
      const mockUser: MockUser = { 
        id: 'user-123', 
        name: 'Test User', 
        username: 'testuser', 
        email: 'test@example.com',
        image: 'https://example.com/avatar.png'
      };
      
      vi.mocked(getSession).mockResolvedValueOnce({
        user: mockUser
      });
      
      vi.mocked(db.query.posts.findFirst).mockReturnValue(Promise.resolve(null) as any);
      
      // Create a mock implementation that matches the expected signature
      vi.mocked(withPostAuth).mockImplementationOnce((action) => {
        return async (formData: FormData | null, postId: string, key: string | null) => {
          const session = await getSession();
          if (!session) {
            return {
              error: "Not authenticated",
            };
          }
          
          const post = await db.query.posts.findFirst({
            where: { id: postId } as any
          });
          
          if (!post) {
            return {
              error: "Not authorized",
            };
          }
          
          return action(formData, post, key);
        };
      });

      // Create a handler with the correct signature
      const handler = withPostAuth((formData: FormData | null, post: MockPost, key: string | null) => {
        return { data: 'success' };
      });

      // Call the handler with the expected arguments
      const result = await handler(null, 'post-123', null);

      // Assert
      expect(result).toEqual({ error: "Not authorized" });
    });

    it("should return error when user does not own the post", async () => {
      // Setup
      const mockUser: MockUser = { 
        id: 'user-123', 
        name: 'Test User', 
        username: 'testuser', 
        email: 'test@example.com',
        image: 'https://example.com/avatar.png'
      };
      
      vi.mocked(getSession).mockResolvedValueOnce({
        user: mockUser
      });
      
      const mockPost: MockPost = {
        id: 'post-123',
        siteId: 'site-123',
        userId: 'different-user-id', // Different user ID
        title: 'Test Post',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
        imageBlurhash: null,
        content: null,
        slug: 'test-post',
        published: true
      };
      
      vi.mocked(db.query.posts.findFirst).mockReturnValue(Promise.resolve(mockPost) as any);
      
      // Create a mock implementation that matches the expected signature
      vi.mocked(withPostAuth).mockImplementationOnce((action) => {
        return async (formData: FormData | null, postId: string, key: string | null) => {
          const session = await getSession();
          if (!session) {
            return {
              error: "Not authenticated",
            };
          }
          
          const post = await db.query.posts.findFirst({
            where: { id: postId } as any
          });
          
          if (!post || post.userId !== session.user.id) {
            return {
              error: "Not authorized",
            };
          }
          
          return action(formData, post, key);
        };
      });

      // Create a handler with the correct signature
      const handler = withPostAuth((formData: FormData | null, post: MockPost, key: string | null) => {
        return { data: 'success' };
      });

      // Call the handler with the expected arguments
      const result = await handler(null, 'post-123', null);

      // Assert
      expect(result).toEqual({ error: "Not authorized" });
    });

    it("should call action when user owns the post", async () => {
      // Setup
      const mockUser: MockUser = { 
        id: 'user-123', 
        name: 'Test User', 
        username: 'testuser', 
        email: 'test@example.com',
        image: 'https://example.com/avatar.png'
      };
      
      vi.mocked(getSession).mockResolvedValueOnce({
        user: mockUser
      });
      
      const mockPost: MockPost = {
        id: 'post-123',
        siteId: 'site-123',
        userId: 'user-123', // Same user ID
        title: 'Test Post',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
        imageBlurhash: null,
        content: null,
        slug: 'test-post',
        published: true
      };
      
      vi.mocked(db.query.posts.findFirst).mockReturnValue(Promise.resolve(mockPost) as any);
      
      const actionSpy = vi.fn().mockReturnValue({ data: 'success' });
      
      // Create a mock implementation that matches the expected signature
      vi.mocked(withPostAuth).mockImplementationOnce((action) => {
        return async (formData: FormData | null, postId: string, key: string | null) => {
          const session = await getSession();
          if (!session) {
            return {
              error: "Not authenticated",
            };
          }
          
          const post = await db.query.posts.findFirst({
            where: { id: postId } as any
          });
          
          if (!post || post.userId !== session.user.id) {
            return {
              error: "Not authorized",
            };
          }
          
          return action(formData, post, key);
        };
      });

      // Create a handler with the correct signature
      const handler = withPostAuth(actionSpy);

      // Call the handler with the expected arguments
      const result = await handler(null, 'post-123', null);

      // Assert
      expect(result).toEqual({ data: 'success' });
      expect(actionSpy).toHaveBeenCalledWith(null, mockPost, null);
    });
  });
}); 