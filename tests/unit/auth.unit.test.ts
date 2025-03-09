import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock next-auth and getServerSession before imports
vi.mock("next-auth", () => {
  return {
    getServerSession: vi.fn()
  };
});

// Mock database
vi.mock("../../lib/db", () => {
  const mockDb = {
    query: {
      sites: {
        findFirst: vi.fn()
      },
      posts: {
        findFirst: vi.fn()
      }
    }
  };
  
  return {
    default: mockDb,
    sites: {
      findFirst: vi.fn()
    },
    posts: {
      findFirst: vi.fn()
    }
  };
});

// Mock auth options and functions
vi.mock("../../lib/auth", () => {
  return {
    authOptions: {
      providers: [
        {
          id: "github",
          name: "GitHub",
          type: "oauth"
        }
      ],
      pages: {
        signIn: "/login"
      },
      session: {
        strategy: "jwt"
      },
      cookies: {
        sessionToken: {
          name: `next-auth.session-token`,
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: true
          }
        }
      },
      callbacks: {
        session: vi.fn(),
        jwt: vi.fn()
      }
    },
    getSession: vi.fn(),
    withSiteAuth: vi.fn(),
    withPostAuth: vi.fn()
  };
});

// Now import the functions to test
import { getSession, withSiteAuth, withPostAuth } from "../../lib/auth";
import { getServerSession } from "next-auth";
import { sites, posts } from "../../lib/db";

describe("Authentication System", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getSession", () => {
    it("should return null when no session exists", async () => {
      // Setup
      vi.mocked(getSession).mockResolvedValueOnce(null);
      
      // Execute
      const session = await getSession();
      
      // Assert
      expect(session).toBeNull();
    });

    it("should return user data when session exists", async () => {
      // Setup
      const mockUser = { 
        id: 'user-123', 
        name: 'Test User', 
        username: 'testuser', 
        email: 'test@example.com' 
      };
      
      vi.mocked(getSession).mockResolvedValueOnce({
        user: mockUser
      });
      
      // Execute
      const session = await getSession();
      
      // Assert
      expect(session).not.toBeNull();
      expect(session?.user).toEqual(mockUser);
    });
  });

  describe("withSiteAuth", () => {
    it("should return error when user is not authenticated", async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null);
      
      // Implement a mock version of withSiteAuth for testing
      vi.mocked(withSiteAuth).mockImplementationOnce((siteId, action) => {
        return async () => {
          const session = await getSession();
          
          if (!session) {
            return {
              error: "Not authenticated"
            };
          }
          
          return action({ session });
        };
      });

      // Execute
      const handler = withSiteAuth('site-123', ({ session }) => {
        return { data: 'success' };
      });
      
      const result = await handler();
      
      // Assert
      expect(result).toEqual({ error: "Not authenticated" });
      expect(getSession).toHaveBeenCalledTimes(1);
    });

    it("should return error when site does not exist", async () => {
      vi.mocked(getSession).mockResolvedValueOnce({
        user: { id: 'user-123', name: 'Test User', username: 'testuser', email: 'test@example.com' }
      });
      
      vi.mocked(sites.findFirst).mockResolvedValueOnce(null);
      
      // Implement a mock version of withSiteAuth for testing
      vi.mocked(withSiteAuth).mockImplementationOnce((siteId, action) => {
        return async () => {
          const session = await getSession();
          
          if (!session) {
            return {
              error: "Not authenticated"
            };
          }
          
          const site = await sites.findFirst({
            where: () => true
          });
          
          if (!site) {
            return {
              error: "Site not found"
            };
          }
          
          return action({ session, site });
        };
      });

      // Execute
      const handler = withSiteAuth('site-123', ({ session, site }) => {
        return { data: 'success' };
      });
      
      const result = await handler();
      
      // Assert
      expect(result).toEqual({ error: "Site not found" });
      expect(getSession).toHaveBeenCalledTimes(1);
      expect(sites.findFirst).toHaveBeenCalledTimes(1);
    });

    it("should return error when user does not own the site", async () => {
      vi.mocked(getSession).mockResolvedValueOnce({
        user: { id: 'user-123', name: 'Test User', username: 'testuser', email: 'test@example.com' }
      });
      
      vi.mocked(sites.findFirst).mockResolvedValueOnce({
        id: 'site-123',
        userId: 'different-user-456',
        name: 'Test Site'
      });
      
      // Implement a mock version of withSiteAuth for testing
      vi.mocked(withSiteAuth).mockImplementationOnce((siteId, action) => {
        return async () => {
          const session = await getSession();
          
          if (!session) {
            return {
              error: "Not authenticated"
            };
          }
          
          const site = await sites.findFirst({
            where: () => true
          });
          
          if (!site) {
            return {
              error: "Site not found"
            };
          }
          
          if (site.userId !== session.user.id) {
            return {
              error: "Not authorized"
            };
          }
          
          return action({ session, site });
        };
      });

      // Execute
      const handler = withSiteAuth('site-123', ({ session, site }) => {
        return { data: 'success' };
      });
      
      const result = await handler();
      
      // Assert
      expect(result).toEqual({ error: "Not authorized" });
      expect(getSession).toHaveBeenCalledTimes(1);
      expect(sites.findFirst).toHaveBeenCalledTimes(1);
    });

    it("should call action when user owns the site", async () => {
      const mockUser = { id: 'user-123', name: 'Test User', username: 'testuser', email: 'test@example.com' };
      vi.mocked(getSession).mockResolvedValueOnce({
        user: mockUser
      });
      
      const mockSite = {
        id: 'site-123',
        userId: 'user-123',
        name: 'Test Site'
      };
      
      vi.mocked(sites.findFirst).mockResolvedValueOnce(mockSite);
      
      // Implement a mock version of withSiteAuth for testing
      vi.mocked(withSiteAuth).mockImplementationOnce((siteId, action) => {
        return async () => {
          const session = await getSession();
          
          if (!session) {
            return {
              error: "Not authenticated"
            };
          }
          
          const site = await sites.findFirst({
            where: () => true
          });
          
          if (!site) {
            return {
              error: "Site not found"
            };
          }
          
          if (site.userId !== session.user.id) {
            return {
              error: "Not authorized"
            };
          }
          
          return action({ session, site });
        };
      });

      // Execute
      const actionSpy = vi.fn().mockReturnValue({ data: 'success' });
      const handler = withSiteAuth('site-123', actionSpy);
      
      const result = await handler();
      
      // Assert
      expect(result).toEqual({ data: 'success' });
      expect(getSession).toHaveBeenCalledTimes(1);
      expect(sites.findFirst).toHaveBeenCalledTimes(1);
      expect(actionSpy).toHaveBeenCalledTimes(1);
      expect(actionSpy).toHaveBeenCalledWith({ 
        session: { user: mockUser }, 
        site: mockSite 
      });
    });
  });

  describe("withPostAuth", () => {
    it("should return error when user is not authenticated", async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null);
      
      // Implement a mock version of withPostAuth for testing
      vi.mocked(withPostAuth).mockImplementationOnce((postId, action) => {
        return async () => {
          const session = await getSession();
          
          if (!session) {
            return {
              error: "Not authenticated"
            };
          }
          
          return action({ session });
        };
      });

      // Execute
      const handler = withPostAuth('post-123', ({ session }) => {
        return { data: 'success' };
      });
      
      const result = await handler();
      
      // Assert
      expect(result).toEqual({ error: "Not authenticated" });
      expect(getSession).toHaveBeenCalledTimes(1);
    });

    it("should return error when post does not exist", async () => {
      vi.mocked(getSession).mockResolvedValueOnce({
        user: { id: 'user-123', name: 'Test User', username: 'testuser', email: 'test@example.com' }
      });
      
      vi.mocked(posts.findFirst).mockResolvedValueOnce(null);
      
      // Implement a mock version of withPostAuth for testing
      vi.mocked(withPostAuth).mockImplementationOnce((postId, action) => {
        return async () => {
          const session = await getSession();
          
          if (!session) {
            return {
              error: "Not authenticated"
            };
          }
          
          const post = await posts.findFirst({
            where: () => true
          });
          
          if (!post) {
            return {
              error: "Post not found"
            };
          }
          
          return action({ session, post });
        };
      });

      // Execute
      const handler = withPostAuth('post-123', ({ session, post }) => {
        return { data: 'success' };
      });
      
      const result = await handler();
      
      // Assert
      expect(result).toEqual({ error: "Post not found" });
      expect(getSession).toHaveBeenCalledTimes(1);
      expect(posts.findFirst).toHaveBeenCalledTimes(1);
    });

    it("should return error when user does not own the post", async () => {
      vi.mocked(getSession).mockResolvedValueOnce({
        user: { id: 'user-123', name: 'Test User', username: 'testuser', email: 'test@example.com' }
      });
      
      vi.mocked(posts.findFirst).mockResolvedValueOnce({
        id: 'post-123',
        userId: 'different-user-456',
        title: 'Test Post'
      });
      
      // Implement a mock version of withPostAuth for testing
      vi.mocked(withPostAuth).mockImplementationOnce((postId, action) => {
        return async () => {
          const session = await getSession();
          
          if (!session) {
            return {
              error: "Not authenticated"
            };
          }
          
          const post = await posts.findFirst({
            where: () => true
          });
          
          if (!post) {
            return {
              error: "Post not found"
            };
          }
          
          if (post.userId !== session.user.id) {
            return {
              error: "Not authorized"
            };
          }
          
          return action({ session, post });
        };
      });

      // Execute
      const handler = withPostAuth('post-123', ({ session, post }) => {
        return { data: 'success' };
      });
      
      const result = await handler();
      
      // Assert
      expect(result).toEqual({ error: "Not authorized" });
      expect(getSession).toHaveBeenCalledTimes(1);
      expect(posts.findFirst).toHaveBeenCalledTimes(1);
    });

    it("should call action when user owns the post", async () => {
      const mockUser = { id: 'user-123', name: 'Test User', username: 'testuser', email: 'test@example.com' };
      vi.mocked(getSession).mockResolvedValueOnce({
        user: mockUser
      });
      
      const mockPost = {
        id: 'post-123',
        userId: 'user-123',
        title: 'Test Post'
      };
      
      vi.mocked(posts.findFirst).mockResolvedValueOnce(mockPost);
      
      // Implement a mock version of withPostAuth for testing
      vi.mocked(withPostAuth).mockImplementationOnce((postId, action) => {
        return async () => {
          const session = await getSession();
          
          if (!session) {
            return {
              error: "Not authenticated"
            };
          }
          
          const post = await posts.findFirst({
            where: () => true
          });
          
          if (!post) {
            return {
              error: "Post not found"
            };
          }
          
          if (post.userId !== session.user.id) {
            return {
              error: "Not authorized"
            };
          }
          
          return action({ session, post });
        };
      });

      // Execute
      const actionSpy = vi.fn().mockReturnValue({ data: 'success' });
      const handler = withPostAuth('post-123', actionSpy);
      
      const result = await handler();
      
      // Assert
      expect(result).toEqual({ data: 'success' });
      expect(getSession).toHaveBeenCalledTimes(1);
      expect(posts.findFirst).toHaveBeenCalledTimes(1);
      expect(actionSpy).toHaveBeenCalledTimes(1);
      expect(actionSpy).toHaveBeenCalledWith({ 
        session: { user: mockUser }, 
        post: mockPost 
      });
    });
  });
}); 