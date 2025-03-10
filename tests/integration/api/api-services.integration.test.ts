import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
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

// Expected services data
const mockServices = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Connect to OpenAI API for GPT models',
    logoUrl: '/images/services/openai.svg',
    apiKeyName: 'API Key',
    apiKeyPattern: '^sk-[a-zA-Z0-9]{48}$',
    apiKeyLink: 'https://platform.openai.com/account/api-keys',
    apiKeyInstructions: 'Create an API key in the OpenAI dashboard',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Connect to Anthropic API for Claude models',
    logoUrl: '/images/services/anthropic.svg',
    apiKeyName: 'API Key',
    apiKeyPattern: '^sk-ant-[a-zA-Z0-9]{48}$',
    apiKeyLink: 'https://console.anthropic.com/account/keys',
    apiKeyInstructions: 'Create an API key in the Anthropic console',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect to GitHub API for repository access',
    logoUrl: '/images/services/github.svg',
    apiKeyName: 'Personal Access Token',
    apiKeyPattern: '^ghp_[a-zA-Z0-9]{36}$',
    apiKeyLink: 'https://github.com/settings/tokens',
    apiKeyInstructions: 'Create a personal access token with repo scope',
  },
];

describe('API Services API Route', () => {
  beforeEach(() => {
    // Mock the session to return a logged-in user
    vi.mocked(getServerSession).mockResolvedValue({
      user: mockUser,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/api-connections/services', () => {
    it('should return a list of supported services', async () => {
      // Create mock request and response
      const { req, res } = createMocks({
        method: 'GET',
      });

      // Call the handler
      await getApiServices(req, res);

      // Verify the response
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockServices);
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mock the session to return null (user not logged in)
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create mock request and response
      const { req, res } = createMocks({
        method: 'GET',
      });

      // Call the handler
      await getApiServices(req, res);

      // Verify the response
      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Unauthorized',
      });
    });
  });
}); 