import { vi, describe, it, expect, beforeEach } from 'vitest';
import { OpenAIService, AnthropicService } from '../../lib/ai-service';

// Mock implementations
const mockOpenAICreate = vi.fn().mockResolvedValue({
  choices: [{ message: { content: 'mocked response' } }]
});

const mockAnthropicCreate = vi.fn().mockResolvedValue({
  content: [{ type: 'text', text: 'mocked response' }]
});

// Mock functions in other modules
vi.mock('../../lib/actions/model-actions', () => ({
  getFullModelId: vi.fn().mockResolvedValue('claude-3-opus-20240229')
}));

// Mock OpenAI and Anthropic
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

// Import the mocked modules so we can spy on them
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OpenAI Service', () => {
    it('should generate a chat response with correct parameters', async () => {
      // Create service and prepare test
      const openaiService = new OpenAIService('gpt-4', 'decrypted-api-key');
      const messages = [{ role: 'user', content: 'Hello!' }];
      
      // Call the method
      const response = await openaiService.generateChatResponse(messages);
      
      // Verify result
      expect(response.content).toBe('mocked response');
      
      // Verify create was called with the right parameters
      expect(mockOpenAICreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
          messages: expect.any(Array)
        })
      );
    });

    it('should handle errors gracefully', async () => {
      // Make it reject for this test only
      mockOpenAICreate.mockRejectedValueOnce(new Error('OpenAI API error'));
      
      // Create service and test
      const openaiService = new OpenAIService('gpt-4', 'decrypted-api-key');
      
      // Call the method and expect it to throw
      await expect(openaiService.generateChatResponse([{ role: 'user', content: 'Test' }]))
        .rejects.toThrow('AI service error: OpenAI API error');
    });
  });

  describe('Anthropic Service', () => {
    it('should generate a chat response with correct parameters', async () => {
      // Create service and prepare test
      const anthropicService = new AnthropicService('claude-3-opus', 'decrypted-api-key');
      const messages = [{ role: 'user', content: 'Hello!' }];
      
      // Call the method
      const response = await anthropicService.generateChatResponse(messages);
      
      // Verify result
      expect(response.content).toBe('mocked response');
      
      // Verify create was called with the right parameters
      expect(mockAnthropicCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-opus',
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