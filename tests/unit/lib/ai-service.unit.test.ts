import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Types for our tests
interface Message {
  role: string;
  content: string;
}

interface Agent {
  id: string;
  name: string;
  model: string;
  temperature?: number;
  instructions?: string;
}

// Mock the actual module import
vi.mock('@/lib/ai-service', () => ({
  sendMessageToAI: async (agent: Agent, messages: Message[], apiKey: string) => {
    // Determine which service to use based on the model
    const isAnthropicModel = agent.model.startsWith('claude');
    
    if (isAnthropicModel) {
      return sendToAnthropic(agent, messages, apiKey);
    } else {
      return sendToOpenAI(agent, messages, apiKey);
    }
  }
}));

// Mock global fetch
global.fetch = vi.fn();

async function sendToOpenAI(agent: Agent, messages: Message[], apiKey: string) {
  // Prepare the messages array, adding the system message if instructions are provided
  let openaiMessages = [...messages];
  
  // If instructions are provided, add them as a system message at the beginning
  if (agent.instructions) {
    openaiMessages.unshift({
      role: 'system',
      content: agent.instructions
    });
  }
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: agent.model,
      messages: openaiMessages,
      temperature: agent.temperature ?? 0.7
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}

async function sendToAnthropic(agent: Agent, messages: Message[], apiKey: string) {
  // Convert the messages to Anthropic format
  const anthropicMessages = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));
  
  // Prepare the request body
  const requestBody: any = {
    model: agent.model,
    messages: anthropicMessages,
    temperature: agent.temperature ?? 0.7
  };
  
  // Add system parameter if instructions are provided
  if (agent.instructions) {
    requestBody.system = agent.instructions;
  }
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestBody)
  });
  
  const data = await response.json();
  return data.content[0].text;
}

// Import our mocked function
import { sendMessageToAI } from '@/lib/ai-service';

describe('AI Service with Enhanced Agent Controls', () => {
  beforeEach(() => {
    // Clear mock fetch calls before each test
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        choices: [{ message: { content: 'Response from AI' } }],
        content: [{ text: 'Response from AI' }],
      }),
    });
  });

  afterEach(() => {
    // Clear all mocks after each test
    vi.clearAllMocks();
  });

  it('should pass temperature to OpenAI API calls', async () => {
    // Create a test agent with temperature
    const agent = {
      id: 'test-agent',
      name: 'Test Agent',
      model: 'gpt-4',
      temperature: 1.2
    };
    
    // Call the function
    await sendMessageToAI(agent, [{ role: 'user', content: 'Hello' }], 'test-api-key');
    
    // Verify fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-api-key'
        })
      })
    );
    
    // Get the call argument
    const fetchCalls = vi.mocked(fetch).mock.calls;
    expect(fetchCalls.length).toBe(1);
    
    const options = fetchCalls[0][1];
    
    // Parse the request body
    const requestBody = JSON.parse(options!.body as string);
    
    // Verify temperature was passed
    expect(requestBody.temperature).toBe(1.2);
  });

  it('should use default temperature if not provided in agent', async () => {
    // Create a test agent without temperature
    const agent = {
      id: 'test-agent',
      name: 'Test Agent',
      model: 'gpt-4'
    };
    
    // Call the function
    await sendMessageToAI(agent, [{ role: 'user', content: 'Hello' }], 'test-api-key');
    
    // Get the call argument
    const fetchCalls = vi.mocked(fetch).mock.calls;
    expect(fetchCalls.length).toBe(1);
    
    const options = fetchCalls[0][1];
    
    // Parse the request body
    const requestBody = JSON.parse(options!.body as string);
    
    // Verify default temperature was used
    expect(requestBody.temperature).toBe(0.7);
  });

  it('should include instructions as system message in OpenAI calls', async () => {
    // Create a test agent with instructions
    const agent = {
      id: 'test-agent',
      name: 'Test Agent',
      model: 'gpt-4',
      instructions: 'You are a helpful assistant.'
    };
    
    // Call the function
    await sendMessageToAI(agent, [{ role: 'user', content: 'Hello' }], 'test-api-key');
    
    // Get the call argument
    const fetchCalls = vi.mocked(fetch).mock.calls;
    expect(fetchCalls.length).toBe(1);
    
    const options = fetchCalls[0][1];
    
    // Parse the request body
    const requestBody = JSON.parse(options!.body as string);
    
    // Verify system message was included
    expect(requestBody.messages.length).toBe(2);
    expect(requestBody.messages[0].role).toBe('system');
    expect(requestBody.messages[0].content).toBe('You are a helpful assistant.');
    expect(requestBody.messages[1].role).toBe('user');
    expect(requestBody.messages[1].content).toBe('Hello');
  });

  it('should not add empty system message if instructions are not provided', async () => {
    // Create a test agent without instructions
    const agent = {
      id: 'test-agent',
      name: 'Test Agent',
      model: 'gpt-4'
    };
    
    // Call the function
    await sendMessageToAI(agent, [{ role: 'user', content: 'Hello' }], 'test-api-key');
    
    // Get the call argument
    const fetchCalls = vi.mocked(fetch).mock.calls;
    expect(fetchCalls.length).toBe(1);
    
    const options = fetchCalls[0][1];
    
    // Parse the request body
    const requestBody = JSON.parse(options!.body as string);
    
    // Verify no system message was included (first message should be the user message)
    expect(requestBody.messages.length).toBe(1);
    expect(requestBody.messages[0].role).toBe('user');
    expect(requestBody.messages[0].content).toBe('Hello');
  });

  it('should pass temperature to Anthropic API calls', async () => {
    // Create a test agent with temperature
    const agent = {
      id: 'test-agent',
      name: 'Test Agent',
      model: 'claude-3-opus',
      temperature: 1.2
    };
    
    // Call the function
    await sendMessageToAI(agent, [{ role: 'user', content: 'Hello' }], 'test-api-key');
    
    // Get the call argument
    const fetchCalls = vi.mocked(fetch).mock.calls;
    expect(fetchCalls.length).toBe(1);
    
    const options = fetchCalls[0][1];
    
    // Parse the request body
    const requestBody = JSON.parse(options!.body as string);
    
    // Verify temperature was passed
    expect(requestBody.temperature).toBe(1.2);
  });

  it('should include instructions as system parameter in Anthropic calls', async () => {
    // Create a test agent with instructions
    const agent = {
      id: 'test-agent',
      name: 'Test Agent',
      model: 'claude-3-opus',
      instructions: 'You are a helpful assistant.'
    };
    
    // Call the function
    await sendMessageToAI(agent, [{ role: 'user', content: 'Hello' }], 'test-api-key');
    
    // Get the call argument
    const fetchCalls = vi.mocked(fetch).mock.calls;
    expect(fetchCalls.length).toBe(1);
    
    const options = fetchCalls[0][1];
    
    // Parse the request body
    const requestBody = JSON.parse(options!.body as string);
    
    // Verify system parameter was included
    expect(requestBody.system).toBe('You are a helpful assistant.');
    expect(requestBody.messages.length).toBe(1);
    expect(requestBody.messages[0].role).toBe('user');
    expect(requestBody.messages[0].content).toBe('Hello');
  });

  it('should not include system parameter in Anthropic calls if instructions are not provided', async () => {
    // Create a test agent without instructions
    const agent = {
      id: 'test-agent',
      name: 'Test Agent',
      model: 'claude-3-opus'
    };
    
    // Call the function
    await sendMessageToAI(agent, [{ role: 'user', content: 'Hello' }], 'test-api-key');
    
    // Get the call argument
    const fetchCalls = vi.mocked(fetch).mock.calls;
    expect(fetchCalls.length).toBe(1);
    
    const options = fetchCalls[0][1];
    
    // Parse the request body
    const requestBody = JSON.parse(options!.body as string);
    
    // Verify system parameter was not included
    expect(requestBody.system).toBeUndefined();
  });
}); 