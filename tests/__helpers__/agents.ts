export const mockAgent = {
  id: 'test-agent-123',
  name: 'Test Agent',
  description: 'A test agent for unit tests' as string | null,
  userId: 'test-user-id',
  systemPrompt: 'You are a helpful assistant for testing purposes.',
  model: 'gpt-3.5-turbo',
  temperature: '0.7',
  maxTokens: 1000 as number | null,
  createdAt: new Date(),
  updatedAt: new Date(),
}; 