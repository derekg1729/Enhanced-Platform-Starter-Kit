# Hello World MVP Agent Creation - Testing Strategy

## Testing Principles
- **Test-Driven Development**: Write tests before implementation
- **Agent-Specific Testing**: Develop tests specifically for agent functionality
- **Comprehensive Coverage**: Test all components and user flows
- **Isolation**: Unit tests should be isolated from external dependencies
- **Integration**: Test how components work together
- **Security**: Thoroughly test encryption and access controls

## Testing Approach

Rather than simply adapting existing tests, we'll develop agent-specific test patterns that address the unique requirements of AI agent functionality:

### Agent-Specific Testing Needs

| Functionality | Testing Approach | Key Considerations |
|---------------|------------------|-------------------|
| API Key Encryption | Unit tests with known inputs/outputs | Test encryption/decryption, error handling |
| AI Service Integration | Unit tests with mocked responses | Test request formatting, response parsing, error handling |
| Streaming Responses | Integration tests with mocked streams | Test stream handling, partial updates, error recovery |
| Chat Context Management | Unit and integration tests | Test context retrieval, message ordering, pagination |
| Multi-tenant Isolation | Integration tests | Test access controls, data separation |

## Test Types

### Unit Tests

Unit tests focus on testing individual components and functions in isolation.

#### Encryption Utilities
```typescript
// tests/unit/encryption.unit.test.ts
import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../../lib/encryption';

describe('Encryption Utilities', () => {
  const testKey = 'd2e372921d15fe9312e6d45740ded074a019027122525ec390889154ba85d72f';
  
  it('should encrypt and decrypt text correctly', () => {
    const originalText = 'test-api-key-12345';
    const encrypted = encrypt(originalText, testKey);
    
    // Encrypted text should be different from original
    expect(encrypted).not.toBe(originalText);
    
    // Should contain two separators (format: iv:authTag:encryptedData)
    expect(encrypted.split(':').length).toBe(3);
    
    // Should decrypt back to original
    const decrypted = decrypt(encrypted, testKey);
    expect(decrypted).toBe(originalText);
  });
  
  it('should throw error when decrypting with wrong key', () => {
    const originalText = 'test-api-key-12345';
    const encrypted = encrypt(originalText, testKey);
    const wrongKey = 'e3e472921d15fe9312e6d45740ded074a019027122525ec390889154ba85d72f';
    
    expect(() => decrypt(encrypted, wrongKey)).toThrow();
  });
  
  it('should throw error when decrypting invalid format', () => {
    const invalidEncrypted = 'invalid-format';
    
    expect(() => decrypt(invalidEncrypted, testKey)).toThrow();
  });
});
```

#### AI Service Integration
```typescript
// tests/unit/openai.unit.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateChatCompletion } from '../../lib/openai';
import { encrypt } from '../../lib/encryption';

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: 'This is a test response',
                },
              },
            ],
          }),
        },
      },
    })),
  };
});

describe('OpenAI Integration', () => {
  const testKey = 'd2e372921d15fe9312e6d45740ded074a019027122525ec390889154ba85d72f';
  const encryptedApiKey = encrypt('sk-test-key', testKey);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should generate chat completion successfully', async () => {
    const messages = [{ role: 'user', content: 'Hello' }];
    
    const response = await generateChatCompletion(
      messages,
      'gpt-3.5-turbo',
      0.7,
      undefined,
      encryptedApiKey,
      testKey
    );
    
    expect(response).toBe('This is a test response');
  });
  
  it('should handle API errors gracefully', async () => {
    // Mock OpenAI to throw an error
    const OpenAI = require('openai').default;
    OpenAI.mockImplementationOnce(() => ({
      chat: {
        completions: {
          create: vi.fn().mockRejectedValue(new Error('API error')),
        },
      },
    }));
    
    const messages = [{ role: 'user', content: 'Hello' }];
    
    await expect(
      generateChatCompletion(
        messages,
        'gpt-3.5-turbo',
        0.7,
        undefined,
        encryptedApiKey,
        testKey
      )
    ).rejects.toThrow('Failed to generate AI response');
  });
});
```

#### Component Tests
```typescript
// tests/unit/components/agent/AgentCard.unit.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import AgentCard from '../../../../components/agent/AgentCard';

describe('AgentCard', () => {
  const mockAgent = {
    id: 'test-id',
    name: 'Test Agent',
    description: 'A test agent',
    model: 'gpt-3.5-turbo',
    createdAt: new Date().toISOString(),
  };
  
  const mockOnDelete = vi.fn();
  const mockOnChat = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders agent information correctly', () => {
    render(
      <AgentCard 
        agent={mockAgent} 
        onDelete={mockOnDelete} 
        onChat={mockOnChat} 
      />
    );
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('A test agent')).toBeInTheDocument();
    expect(screen.getByText('gpt-3.5-turbo')).toBeInTheDocument();
  });
  
  it('calls onDelete when delete button is clicked and confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(
      <AgentCard 
        agent={mockAgent} 
        onDelete={mockOnDelete} 
        onChat={mockOnChat} 
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnDelete).toHaveBeenCalledWith('test-id');
  });
  
  it('calls onChat when chat button is clicked', () => {
    render(
      <AgentCard 
        agent={mockAgent} 
        onDelete={mockOnDelete} 
        onChat={mockOnChat} 
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /chat/i }));
    
    expect(mockOnChat).toHaveBeenCalledWith('test-id');
  });
});
```

### Integration Tests

Integration tests focus on how components interact with each other and external services.

#### API Route Tests
```typescript
// tests/integration/api/agents.integration.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import { getSession } from 'next-auth/react';
import agentsHandler from '../../../app/api/agents/route';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  getSession: vi.fn(),
}));

// Mock database
vi.mock('../../../lib/db', () => ({
  db: {
    query: vi.fn(),
    transaction: vi.fn(),
  },
}));

describe('Agents API', () => {
  let server;
  
  beforeAll(() => {
    server = createServer((req, res) => {
      apiResolver(req, res, undefined, agentsHandler, {}, undefined);
    }).listen(3000);
  });
  
  afterAll(() => {
    server.close();
  });
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock authenticated session
    getSession.mockResolvedValue({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
    });
  });
  
  it('should return agents for authenticated user', async () => {
    // Mock database response
    const db = require('../../../lib/db').db;
    db.query.agents.findMany.mockResolvedValue([
      {
        id: 'test-agent-id',
        name: 'Test Agent',
        description: 'A test agent',
        model: 'gpt-3.5-turbo',
        createdAt: new Date().toISOString(),
        userId: 'test-user-id',
      },
    ]);
    
    const response = await fetch('http://localhost:3000/api/agents');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.length).toBe(1);
    expect(data[0].name).toBe('Test Agent');
    
    // Verify database was queried with correct user ID
    expect(db.query.agents.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'test-user-id',
      },
    });
  });
  
  it('should return 401 for unauthenticated user', async () => {
    // Mock unauthenticated session
    getSession.mockResolvedValue(null);
    
    const response = await fetch('http://localhost:3000/api/agents');
    
    expect(response.status).toBe(401);
  });
});
```

#### Streaming Response Tests
```typescript
// tests/integration/api/agent-chat.integration.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import { getSession } from 'next-auth/react';
import agentChatHandler from '../../../app/api/agents/[id]/chat/route';

// Mock streaming response
const mockStream = async function* () {
  yield { choices: [{ delta: { content: 'Hello' } }] };
  yield { choices: [{ delta: { content: ' world' } }] };
  yield { choices: [{ delta: { content: '!' } }] };
};

// Mock OpenAI
vi.mock('../../../lib/openai', () => ({
  generateStreamingChatCompletion: vi.fn().mockResolvedValue(mockStream()),
}));

describe('Agent Chat API', () => {
  let server;
  
  beforeAll(() => {
    server = createServer((req, res) => {
      const { id } = req.query;
      apiResolver(req, res, { id }, agentChatHandler, {}, undefined);
    }).listen(3000);
  });
  
  afterAll(() => {
    server.close();
  });
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock authenticated session
    getSession.mockResolvedValue({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
    });
  });
  
  it('should stream responses for chat messages', async () => {
    const response = await fetch('http://localhost:3000/api/agents/test-agent-id/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Test message',
      }),
    });
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    
    // Read the stream
    const reader = response.body.getReader();
    let result = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += new TextDecoder().decode(value);
    }
    
    expect(result).toContain('Hello world!');
  });
});
```

### End-to-End Tests

End-to-end tests focus on complete user flows.

```typescript
// tests/e2e/agent-creation.e2e.test.ts
import { test, expect } from '@playwright/test';

test('complete agent creation flow', async ({ page }) => {
  // Log in
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Navigate to agents page
  await page.goto('/app/agents');
  
  // Click create agent button
  await page.click('button:has-text("Create Agent")');
  
  // Fill agent form
  await page.fill('input[name="name"]', 'Test Agent');
  await page.fill('textarea[name="description"]', 'A test agent');
  await page.selectOption('select[name="model"]', 'gpt-3.5-turbo');
  await page.fill('textarea[name="systemPrompt"]', 'You are a helpful assistant.');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Verify agent was created
  await expect(page).toHaveURL(/\/app\/agents\/[\w-]+/);
  await expect(page.locator('h1')).toHaveText('Test Agent');
  
  // Test chat functionality
  await page.fill('textarea[name="message"]', 'Hello');
  await page.click('button:has-text("Send")');
  
  // Verify response
  await expect(page.locator('.message-assistant')).toBeVisible();
});
```

## Test Implementation Strategy

### 1. Set Up Testing Infrastructure

- Configure Vitest for unit and integration tests
- Configure Playwright for end-to-end tests
- Set up test database for integration tests
- Create test utilities for common operations

### 2. Create Test Mocks

- Mock AI service responses
- Mock authentication
- Mock database operations
- Mock streaming responses

### 3. Implement Unit Tests

- Test encryption utilities
- Test AI service integration
- Test component rendering and interactions
- Test form validation

### 4. Implement Integration Tests

- Test API routes
- Test database operations
- Test streaming responses
- Test multi-tenant isolation

### 5. Implement End-to-End Tests

- Test agent creation flow
- Test chat functionality
- Test API key management

## Test Coverage Goals

- **Unit Tests**: 90% coverage
- **Integration Tests**: 80% coverage
- **End-to-End Tests**: Cover all critical user flows

## Test Maintenance

- Keep tests up to date with code changes
- Refactor tests when necessary
- Document test patterns and best practices
- Run tests automatically in CI/CD pipeline

## Security Testing

Security testing is particularly important for this feature due to the handling of API keys and multi-tenant data.

### API Key Security Tests

- Test encryption/decryption of API keys
- Test access controls for API keys
- Test API key validation
- Test error handling for invalid API keys

### Multi-Tenant Security Tests

- Test isolation between tenants
- Test access controls for agents
- Test access controls for API connections
- Test access controls for agent messages

### Authentication Tests

- Test authentication requirements for all routes
- Test session validation
- Test error handling for unauthenticated requests 