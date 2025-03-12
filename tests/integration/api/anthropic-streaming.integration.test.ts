import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnthropicStream } from '../../../lib/anthropic';
import { ReadableStream } from 'stream/web';

describe('Anthropic Streaming', () => {
  // Mock console methods to avoid cluttering test output
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should handle AsyncIterable Anthropic API response correctly', async () => {
    // This test verifies that our implementation can handle AsyncIterable responses
    // which is what the Anthropic API actually returns
    
    // Create a mock Anthropic API response as AsyncIterable
    const mockAnthropicResponse = {
      [Symbol.asyncIterator]: async function*() {
        yield { type: 'content_block_delta', delta: { text: 'Hello' } };
        yield { type: 'content_block_delta', delta: { text: ' world' } };
        yield { type: 'content_block_delta', delta: { text: '!' } };
      }
    };
    
    // Process the AsyncIterable with our AnthropicStream function
    const stream = AnthropicStream(mockAnthropicResponse);
    expect(stream).toBeInstanceOf(ReadableStream);
    
    // Verify we can read from the resulting stream
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    // Convert the chunks to a string
    const decoder = new TextDecoder();
    const text = chunks.map(chunk => decoder.decode(chunk)).join('');
    
    // Verify the content
    expect(text).toBe('Hello world!');
  });

  it('should work with a ReadableStream', async () => {
    // This test shows that the function still works with a ReadableStream
    
    // Create a mock ReadableStream that has getReader
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue({ type: 'content_block_delta', delta: { text: 'Hello' } });
        controller.enqueue({ type: 'content_block_delta', delta: { text: ' world' } });
        controller.enqueue({ type: 'content_block_delta', delta: { text: '!' } });
        controller.close();
      }
    });
    
    // Process the ReadableStream with our AnthropicStream function
    const result = AnthropicStream(mockStream);
    expect(result).toBeInstanceOf(ReadableStream);
    
    // Verify we can read from the stream
    const reader = result.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    // Convert the chunks to a string
    const decoder = new TextDecoder();
    const text = chunks.map(chunk => decoder.decode(chunk)).join('');
    
    // Verify the content
    expect(text).toBe('Hello world!');
  });

  it('should throw an error for unsupported stream types', async () => {
    // This test verifies that our implementation throws an error for unsupported stream types
    
    // Create an object that is neither AsyncIterable nor ReadableStream
    const invalidStream = { foo: 'bar' };
    
    // Process the invalid stream
    // @ts-ignore - We're intentionally passing an invalid type
    const stream = AnthropicStream(invalidStream);
    
    // The error is thrown when we try to read from the stream, not when creating it
    const reader = stream.getReader();
    
    // Expect an error when reading from the stream
    await expect(async () => {
      await reader.read();
    }).rejects.toThrow('Unsupported stream type');
  });

  it('should handle callbacks correctly', async () => {
    // This test verifies that our implementation calls the callbacks correctly
    
    // Create mock callbacks
    const onToken = vi.fn();
    const onCompletion = vi.fn();
    
    // Create a mock Anthropic API response as AsyncIterable
    const mockAnthropicResponse = {
      [Symbol.asyncIterator]: async function*() {
        yield { type: 'content_block_delta', delta: { text: 'Hello' } };
        yield { type: 'content_block_delta', delta: { text: ' world' } };
        yield { type: 'content_block_delta', delta: { text: '!' } };
      }
    };
    
    // Process the AsyncIterable with our AnthropicStream function
    const stream = AnthropicStream(mockAnthropicResponse, { onToken, onCompletion });
    
    // Read the entire stream to trigger the callbacks
    const reader = stream.getReader();
    while (true) {
      const { done } = await reader.read();
      if (done) break;
    }
    
    // Verify the callbacks were called correctly
    expect(onToken).toHaveBeenCalledTimes(3);
    expect(onToken).toHaveBeenNthCalledWith(1, 'Hello');
    expect(onToken).toHaveBeenNthCalledWith(2, ' world');
    expect(onToken).toHaveBeenNthCalledWith(3, '!');
    
    expect(onCompletion).toHaveBeenCalledTimes(1);
    expect(onCompletion).toHaveBeenCalledWith('Hello world!');
  });
}); 