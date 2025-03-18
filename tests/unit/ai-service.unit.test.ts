import { vi, describe, it, expect, beforeEach } from 'vitest';

// Create mock functions for testing
const mockOpenAICreate = vi.fn().mockResolvedValue({
  choices: [{ message: { content: 'mocked response' } }]
});

const mockAnthropicCreate = vi.fn().mockResolvedValue({
  content: [{ type: 'text', text: 'mocked response' }]
});

// Mock the OpenAI and Anthropic dependencies
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockOpenAICreate
        }
      }
    }))
  };
});

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: mockAnthropicCreate
      }
    }))
  };
});

// Mock the encryption module
vi.mock('@/lib/encryption', () => ({
  decrypt: vi.fn().mockReturnValue('decrypted-api-key'),
}));

// Import after mocking
import { createAIService, OpenAIService, AnthropicService } from '@/lib/ai-service';
import { decrypt } from '@/lib/encryption';

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('Factory Function', () => {
    it('should create an OpenAI service for OpenAI models', () => {
      const service = createAIService('gpt-4', 'encrypted-api-key');
      expect(service).toBeInstanceOf(OpenAIService);
      expect(decrypt).toHaveBeenCalledWith('encrypted-api-key', expect.any(String));
    });

    it('should create an Anthropic service for Anthropic models', () => {
      const service = createAIService('claude-3-opus', 'encrypted-api-key');
      expect(service).toBeInstanceOf(AnthropicService);
      expect(decrypt).toHaveBeenCalledWith('encrypted-api-key', expect.any(String));
    });

    it('should throw an error for unsupported models', () => {
      expect(() => createAIService('unsupported-model', 'encrypted-api-key'))
        .toThrow('Unsupported model: unsupported-model');
    });
  });

  describe('OpenAI Service', () => {
    it('should generate a chat response with correct parameters', async () => {
      // Create the service
      const openAIService = new OpenAIService('gpt-4', 'decrypted-api-key');
      
      // Create messages
      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello!' }
      ];
      
      // Call the method
      const response = await openAIService.generateChatResponse(messages);
      
      // Verify result
      expect(response.content).toBe('mocked response');
      
      // Verify create was called with the right parameters
      expect(mockOpenAICreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({ role: 'user' })
          ])
        })
      );
    });

    it('should handle errors gracefully', async () => {
      // Make it reject for this test only
      mockOpenAICreate.mockRejectedValueOnce(new Error('OpenAI API error'));
      
      // Create service and test
      const openAIService = new OpenAIService('gpt-4', 'decrypted-api-key');
      
      // Call the method and expect it to throw
      await expect(openAIService.generateChatResponse([{ role: 'user', content: 'Test' }]))
        .rejects.toThrow('AI service error: OpenAI API error');
    });
  });

  describe('Anthropic Service', () => {
    it('should generate a chat response with correct parameters', async () => {
      // Create the service
      const anthropicService = new AnthropicService('claude-3-opus', 'decrypted-api-key');
      
      // Create messages
      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello!' }
      ];
      
      // Call the method
      const response = await anthropicService.generateChatResponse(messages);
      
      // Verify result
      expect(response.content).toBe('mocked response');
      
      // Verify create was called with the right parameters
      expect(mockAnthropicCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-opus-20240229',
          messages: expect.any(Array)
        })
      );
    });

    it('should handle errors gracefully', async () => {
      // Make it reject for this test only
      mockAnthropicCreate.mockRejectedValueOnce(new Error('Anthropic API error'));
      
      // Create service and test
      const anthropicService = new AnthropicService('claude-3-opus', 'decrypted-api-key');
      
      // Call the method and expect it to throw
      await expect(anthropicService.generateChatResponse([{ role: 'user', content: 'Test' }]))
        .rejects.toThrow('AI service error: Anthropic API error');
    });
  });
}); 