# Hello World MVP Agent Creation - Testing Strategy

## Testing Principles
- **Test-Driven Development**: Write tests before implementation
- **Leverage Existing Tests**: Reuse and adapt existing tests for sites components
- **Comprehensive Coverage**: Test all components and user flows
- **Isolation**: Unit tests should be isolated from external dependencies
- **Integration**: Test how components work together

## Test Reuse Strategy

### Existing Tests to Reuse

| Sites Test | Agent Test | Reuse Strategy | Modifications Needed |
|------------|------------|----------------|----------------------|
| `SiteCard.test.tsx` | `AgentCard.test.tsx` | Adapt | Change test data and assertions |
| `Sites.test.tsx` | `Agents.test.tsx` | Adapt | Change test data and assertions |
| `CreateSiteButton.test.tsx` | `CreateAgentButton.test.tsx` | Adapt | Change text expectations |
| `SiteForm.test.tsx` | `AgentForm.test.tsx` | Adapt | Change form field expectations |
| `sites-api.test.ts` | `agents-api.test.ts` | Adapt | Change endpoints and data models |
| `auth-checks.test.ts` | Same | Direct reuse | None |
| `form-validation.test.ts` | Same | Direct reuse | Add agent-specific validations |

### Test Adaptation Process
1. Copy the existing test file as a starting point
2. Update imports to reference agent components
3. Update test data to use agent properties
4. Update assertions to verify agent-specific behavior
5. Add tests for new functionality not present in sites

## Test Types

### Unit Tests
Unit tests focus on testing individual components in isolation.

#### Adapted Component Tests
- **AgentCard.unit.test.tsx** (adapted from SiteCard tests)
  - Test rendering with different agent data
  - Test edit button functionality
  - Test delete button functionality
  - Test error handling during deletion

- **AgentDashboard.unit.test.tsx** (adapted from Sites dashboard tests)
  - Test rendering with agents
  - Test rendering with no agents (empty state)
  - Test loading state
  - Test error state
  - Test create agent button functionality

- **AgentForm.unit.test.tsx** (adapted from SiteForm tests)
  - Test form validation
  - Test model selection
  - Test form submission
  - Test error handling during submission

#### New Component Tests
- **ApiKeyForm.unit.test.tsx**
  - Test form validation
  - Test form submission
  - Test error handling during submission
  - Test secure display of API keys

- **AgentChatWrapper.unit.test.tsx**
  - Test rendering conversation history
  - Test message input and submission
  - Test loading states
  - Test error handling

#### Utility Tests
- **api-key-utils.unit.test.ts**
  - Test encryption and decryption
  - Test error handling for invalid inputs
  - Test validation functions

### Integration Tests
Integration tests focus on how components interact with each other and external services.

#### API Route Tests
- **agents.integration.test.ts** (adapted from sites API tests)
  - Test creating an agent
  - Test retrieving agents
  - Test updating an agent
  - Test deleting an agent
  - Test authentication requirements

- **api-connections.integration.test.ts**
  - Test creating an API connection
  - Test retrieving API connections
  - Test updating an API connection
  - Test deleting an API connection
  - Test authentication requirements

- **chat.integration.test.ts**
  - Test sending a message
  - Test receiving a response
  - Test conversation history
  - Test error handling

#### Database Tests
- **agent-db.integration.test.ts** (adapted from site-db tests)
  - Test database operations for agents
  - Test relationships between agents and API connections
  - Test multi-tenant isolation

### End-to-End Tests
End-to-end tests focus on complete user flows.

- **agent-creation.e2e.test.ts** (adapted from site-creation tests)
  - Test the complete agent creation flow
  - Test validation and error handling
  - Test successful creation and redirection

- **agent-chat.e2e.test.ts**
  - Test the complete chat flow
  - Test sending and receiving messages
  - Test error handling

## Test Implementation

### Mocking Strategy
- Use MSW (Mock Service Worker) to mock API responses
- Use Jest mocks for utility functions
- Use React Testing Library for component testing

### Test Data
- Create factory functions for generating test data
- Use consistent test data across all tests
- Adapt existing test data factories from sites tests

### Test Environment
- Use Vitest for running tests
- Use React Testing Library for rendering components
- Use MSW for mocking API requests
- Use a test database for integration tests

## Test Coverage Goals
- **Unit Tests**: 90% coverage
- **Integration Tests**: 80% coverage
- **End-to-End Tests**: Cover all critical user flows

## Regression Testing
- Run all tests before committing changes
- Ensure changes to shared components don't break sites functionality
- Automate regression testing in CI/CD pipeline
- Monitor test coverage over time

## Test Maintenance
- Keep tests up to date with code changes
- Refactor tests when necessary
- Document test patterns and best practices

## Example Test Implementation

### Unit Test Example (AgentCard adapted from SiteCard)
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import AgentCard from './AgentCard';

describe('AgentCard', () => {
  // Reuse the same structure as SiteCard tests
  const mockAgent = {
    id: '123',
    name: 'Test Agent',
    description: 'A test agent',
    model: 'gpt-3.5-turbo',
    createdAt: new Date().toISOString(),
    status: 'active',
  };

  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders agent information correctly', () => {
    render(<AgentCard agent={mockAgent} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('A test agent')).toBeInTheDocument();
    expect(screen.getByText('gpt-3.5-turbo')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked and confirmed', () => {
    // Mock window.confirm to return true
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(<AgentCard agent={mockAgent} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnDelete).toHaveBeenCalledWith('123');
  });

  it('does not call onDelete when delete is canceled', () => {
    // Mock window.confirm to return false
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    
    render(<AgentCard agent={mockAgent} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});
```

### Integration Test Example (Agents API adapted from Sites API)
```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { getAgentsByUserId, createAgent, deleteAgent } from '../lib/agent-db';

// Reuse the same structure as sites API tests
const mockSession = {
  user: {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
  },
};

// Setup MSW server
const server = setupServer(
  rest.get('/api/auth/session', (req, res, ctx) => {
    return res(ctx.json(mockSession));
  }),
  
  rest.get('/api/agents', (req, res, ctx) => {
    return res(ctx.json([
      {
        id: 'agent-123',
        name: 'Test Agent',
        description: 'A test agent',
        model: 'gpt-3.5-turbo',
        userId: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]));
  }),
  
  rest.post('/api/agents', (req, res, ctx) => {
    const { name, description, model } = req.body;
    
    return res(ctx.status(201), ctx.json({
      id: 'new-agent-123',
      name,
      description,
      model,
      userId: 'user-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }),
  
  rest.delete('/api/agents/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),
);

beforeAll(() => server.listen());
afterAll(() => server.close());
beforeEach(() => server.resetHandlers());

describe('Agent API Integration', () => {
  it('should fetch agents for a user', async () => {
    const agents = await getAgentsByUserId('user-123');
    
    expect(agents).toHaveLength(1);
    expect(agents[0].name).toBe('Test Agent');
  });
  
  it('should create a new agent', async () => {
    const newAgent = await createAgent('user-123', {
      name: 'New Agent',
      description: 'A new test agent',
      systemPrompt: 'You are a helpful assistant',
      model: 'gpt-4',
    });
    
    expect(newAgent.id).toBe('new-agent-123');
    expect(newAgent.name).toBe('New Agent');
  });
  
  it('should delete an agent', async () => {
    const result = await deleteAgent('agent-123', 'user-123');
    
    expect(result).toBe(true);
  });
});
``` 