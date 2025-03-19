import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Message } from '@/lib/ai-service';

// Create mock for Anthropic messages.create
const mockCreate = vi.fn().mockResolvedValue({
  content: [{ type: 'text', text: 'Mock response' }]
});

// Mock the Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: mockCreate
      };
    }
  };
});

// Mock the decrypt function
vi.mock('@/lib/encryption', () => ({
  decrypt: vi.fn().mockReturnValue('decrypted-api-key')
}));

// Import after mocking
import { AnthropicService, sendMessageToAI } from '@/lib/ai-service';

describe('Anthropic Integration Tests', () => {
  let anthropicService: AnthropicService;

  beforeEach(() => {
    vi.clearAllMocks();
    anthropicService = new AnthropicService('claude-3-opus', 'test-api-key');
  });

  it('should pass temperature parameter correctly to Anthropic API', async () => {
    // Messages without system instructions
    const messages: Message[] = [
      { role: 'user', content: 'Hello' }
    ];

    // Call with specific temperature
    await anthropicService.generateChatResponse(messages, { temperature: 0.8 });

    // Verify temperature was passed correctly
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        temperature: 0.8
      })
    );
  });

  it('should pass default temperature if none is provided', async () => {
    // Messages without system instructions
    const messages: Message[] = [
      { role: 'user', content: 'Hello' }
    ];

    // Call without specific temperature
    await anthropicService.generateChatResponse(messages);

    // Verify temperature was set to a default value (not undefined)
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.temperature).not.toBeUndefined();
  });

  it('should handle system instructions correctly', async () => {
    // Messages with a system instruction
    const messages: Message[] = [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Hello' }
    ];

    // Call the service
    await anthropicService.generateChatResponse(messages);

    // Verify system parameter was passed correctly
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: 'You are a helpful assistant'
      })
    );

    // Verify the system message was not included in the messages array
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.messages.length).toBe(1);
    expect(callArgs.messages[0].role).toBe('user');
  });

  it('should combine multiple system messages correctly', async () => {
    // Messages with multiple system instructions
    const messages: Message[] = [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'system', content: 'Be concise' },
      { role: 'user', content: 'Hello' }
    ];

    // Call the service
    await anthropicService.generateChatResponse(messages);

    // Verify system parameter combines the system messages
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: 'You are a helpful assistant\nBe concise'
      })
    );

    // Verify the system messages were not included in the messages array
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.messages.length).toBe(1);
    expect(callArgs.messages[0].role).toBe('user');
  });

  it('should handle both temperature and system instructions together', async () => {
    // Messages with a system instruction
    const messages: Message[] = [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Hello' }
    ];

    // Call with specific temperature
    await anthropicService.generateChatResponse(messages, { temperature: 1.2 });

    // Verify both parameters were passed correctly
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: 'You are a helpful assistant',
        temperature: 1
      })
    );
  });
});

describe('Send Message to AI with Anthropic Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass agent temperature to Anthropic service', async () => {
    // Create a test agent with temperature
    const agent = {
      model: 'claude-3-opus',
      temperature: 0.9,
    };

    // Call sendMessageToAI with the agent
    await sendMessageToAI(agent, [{ role: 'user', content: 'Hello' }], 'encrypted-api-key');

    // Verify the temperature was passed to the Anthropic API
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        temperature: 0.9
      })
    );
  });

  it('should pass agent instructions to Anthropic service as system parameter', async () => {
    // Create a test agent with instructions
    const agent = {
      model: 'claude-3-opus',
      instructions: 'You are a helpful coding assistant',
    };

    // Call sendMessageToAI with the agent
    await sendMessageToAI(agent, [{ role: 'user', content: 'Help me debug' }], 'encrypted-api-key');

    // Verify the instructions were passed to the Anthropic API as system parameter
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: 'You are a helpful coding assistant'
      })
    );
  });

  it('should handle both temperature and instructions together with Anthropic', async () => {
    // Create a test agent with both temperature and instructions
    const agent = {
      model: 'claude-3-opus',
      temperature: 1.0,
      instructions: 'You are a helpful coding assistant',
    };

    // Call sendMessageToAI with the agent
    await sendMessageToAI(agent, [{ role: 'user', content: 'Help me debug' }], 'encrypted-api-key');

    // Verify both temperature and instructions were passed correctly
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        temperature: 1.0,
        system: 'You are a helpful coding assistant'
      })
    );
  });
}); 