import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateChatCompletion, AnthropicStream } from '../../lib/anthropic';
import { getDecryptedApiKey } from '../../lib/agent-db';

// Mock the agent-db module
vi.mock('../../lib/agent-db', () => ({
  getDecryptedApiKey: vi.fn(),
}));

// Mock Anthropic
vi.mock('@anthropic-ai/sdk', () => {
  const mockCreate = vi.fn().mockResolvedValue({
    id: 'msg_test123',
    type: 'message',
    role: 'assistant',
    content: [{ type: 'text', text: 'This is a test response from Claude' }],
    model: 'claude-3-haiku-20240307',
    stream: {
      getReader: () => ({
        read: vi.fn().mockResolvedValue({ done: true })
      })
    },
  });

  return {
    Anthropic: vi.fn().mockImplementation(() => ({
      messages: {
        create: mockCreate,
      },
    })),
  };
});

describe('Anthropic Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getDecryptedApiKey as any).mockResolvedValue('test-api-key');
  });

  describe('generateChatCompletion', () => {
    it('should throw an error if API key is not found', async () => {
      (getDecryptedApiKey as any).mockResolvedValue(null);

      await expect(generateChatCompletion({
        apiConnectionId: 'test-connection',
        userId: 'test-user',
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'claude-3-haiku-20240307',
      })).rejects.toThrow('API key not found');
    });

    it('should call Anthropic with the correct parameters', async () => {
      const { Anthropic } = await import('@anthropic-ai/sdk');
      const mockCreate = vi.fn().mockResolvedValue({
        id: 'msg_test123',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'This is a test response from Claude' }],
        model: 'claude-3-haiku-20240307',
      });

      (Anthropic as any).mockImplementation(() => ({
        messages: {
          create: mockCreate,
        },
      }));

      await generateChatCompletion({
        apiConnectionId: 'test-connection',
        userId: 'test-user',
        messages: [
          { role: 'system', content: 'You are a helpful assistant' },
          { role: 'user', content: 'Hello' }
        ],
        model: 'claude-3-haiku-20240307',
        temperature: 0.7,
        max_tokens: 1000,
      });

      expect(Anthropic).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
      });

      // Check that the messages were transformed correctly
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        model: 'claude-3-haiku-20240307',
        temperature: 0.7,
        max_tokens: 1000,
      }));
    });

    it('should return the response from Anthropic', async () => {
      const result = await generateChatCompletion({
        apiConnectionId: 'test-connection',
        userId: 'test-user',
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'claude-3-haiku-20240307',
      });

      expect(result).toBeDefined();
    });
  });

  describe('AnthropicStream', () => {
    it('should create a ReadableStream from an Anthropic streaming response', async () => {
      // Mock a ReadableStream for Anthropic streaming response
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({ 
            done: false, 
            value: { 
              type: 'content_block_delta', 
              delta: { text: 'Hello' } 
            } 
          })
          .mockResolvedValueOnce({ 
            done: false, 
            value: { 
              type: 'content_block_delta', 
              delta: { text: ' world' } 
            } 
          })
          .mockResolvedValueOnce({ done: true }),
      };
      
      const mockStream = {
        getReader: () => mockReader,
      };

      const callbacks = {
        onCompletion: vi.fn(),
        onToken: vi.fn(),
      };

      const stream = AnthropicStream(mockStream as any, callbacks);

      expect(stream).toBeInstanceOf(ReadableStream);

      // Test that the stream produces the expected output
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      
      const { value: chunk1 } = await reader.read();
      expect(decoder.decode(chunk1)).toBe('Hello');
      
      const { value: chunk2 } = await reader.read();
      expect(decoder.decode(chunk2)).toBe(' world');
      
      const { done } = await reader.read();
      expect(done).toBe(true);
      expect(callbacks.onCompletion).toHaveBeenCalledWith('Hello world');
    });
  });
}); 