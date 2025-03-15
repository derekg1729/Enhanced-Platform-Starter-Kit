# Hello World V2 Technical Specification

## Architecture

The Hello World V2 agent will follow a clean architecture pattern with clear separation of concerns:

```
/app
  /agents
    /hello-world-v2
      /components        # UI components
      /hooks             # Custom React hooks
      /lib               # Utility functions
      /api               # API route handlers
      /tests             # Test files
      /types             # TypeScript type definitions
      /constants         # Constants and configuration
      page.tsx           # Main agent page
      layout.tsx         # Layout component
```

## Component Specifications

### Agent Configuration Component

```typescript
// Component for configuring the Hello World V2 agent
interface AgentConfigProps {
  config: Agent;
  onConfigChange: (config: Partial<Agent>) => Promise<void>;
  isLoading?: boolean;
}

// Implementation will include form elements for each configuration option
// with proper validation and error handling
```

### Greeting Display Component

```typescript
// Component for displaying greetings
interface GreetingDisplayProps {
  greeting: Message;
  theme: 'light' | 'dark' | 'system';
  onRegenerate?: () => void;
}

// Implementation will include animated text display,
// language indicator, and timestamp formatting
```

### Language Selector Component

```typescript
// Component for selecting greeting language
interface LanguageSelectorProps {
  languages: Array<{ code: string; name: string }>;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  disabled?: boolean;
}

// Implementation will include a dropdown or button group
// with language options and proper accessibility
```

## API Implementation Details

### Agent Service

```typescript
// Core agent service implementation
class AgentService {
  constructor(private db: Database) {}

  // Get all agents for a user
  async getAgents(userId: string): Promise<Agent[]> {
    // Implementation to fetch agents from database
  }

  // Get a specific agent by ID
  async getAgentById(id: string, userId: string): Promise<Agent | null> {
    // Implementation to fetch agent from database
  }

  // Create a new agent
  async createAgent(agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agent> {
    // Implementation to create agent in database
  }

  // Update an existing agent
  async updateAgent(id: string, userId: string, updates: Partial<Agent>): Promise<Agent> {
    // Implementation to update agent in database
  }

  // Delete an agent
  async deleteAgent(id: string, userId: string): Promise<void> {
    // Implementation to delete agent from database
  }
}
```

### API Routes

```typescript
// GET /api/agents
export async function GET(req: Request) {
  try {
    // Get user ID from session
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get agents for user
    const agentService = new AgentService(db);
    const agents = await agentService.getAgents(session.user.id);

    return Response.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return Response.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST /api/agents
export async function POST(req: Request) {
  try {
    // Get user ID from session
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();

    // Validate request body
    // Implementation to validate request body

    // Create agent
    const agentService = new AgentService(db);
    const agent = await agentService.createAgent({
      ...body,
      userId: session.user.id,
    });

    return Response.json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    return Response.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
```

## Database Schema

```typescript
// Agent model
export const agents = pgTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  systemPrompt: text('system_prompt'),
  model: text('model').notNull(),
  temperature: text('temperature').default('0.7'),
  maxTokens: integer('max_tokens').default(1000),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Message model
export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  agentId: text('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const agentsRelations = relations(agents, ({ many }) => ({
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  agent: one(agents, {
    fields: [messages.agentId],
    references: [agents.id],
  }),
}));
```

## Testing Specifications

### Unit Tests

```typescript
// Example test for the agent service
describe('AgentService', () => {
  it('should create an agent', async () => {
    // Mock database
    const mockDb = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'test-id', name: 'Test Agent' }]),
    };
    
    const service = new AgentService(mockDb as any);
    
    const agent = await service.createAgent({
      name: 'Test Agent',
      description: 'A test agent',
      model: 'gpt-3.5-turbo',
      userId: 'test-user-id',
    });
    
    expect(agent.id).toBe('test-id');
    expect(agent.name).toBe('Test Agent');
    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalled();
    expect(mockDb.returning).toHaveBeenCalled();
  });
  
  // Additional tests for other methods
});
```

### Integration Tests

```typescript
// Example test for the agents API
describe('Agents API', () => {
  it('should return agents for the authenticated user', async () => {
    // Mock authenticated user
    mockAuthenticatedUser('test-user-id');
    
    // Mock database response
    mockDatabaseResponse([
      {
        id: 'test-agent-id',
        name: 'Test Agent',
        description: 'A test agent',
        model: 'gpt-3.5-turbo',
        userId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    
    // Call API
    const response = await fetch('/api/agents');
    
    const data = await response.json();
    
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe('test-agent-id');
    expect(data[0].name).toBe('Test Agent');
    expect(response.status).toBe(200);
  });
  
  // Additional tests for other endpoints
});
```

## Performance Considerations

1. **Caching Strategy**
   - Cache agent configurations in memory for frequent access
   - Use SWR for frontend data fetching with appropriate revalidation

2. **Bundle Size Optimization**
   - Use code splitting for agent components
   - Lazy load non-critical components

3. **Rendering Strategy**
   - Use server components for initial rendering
   - Use client components only where interactivity is needed

## Accessibility Requirements

1. **Keyboard Navigation**
   - All interactive elements must be keyboard accessible
   - Focus states must be clearly visible

2. **Screen Reader Support**
   - All form elements must have proper labels
   - Dynamic content changes must be announced appropriately

3. **Color Contrast**
   - All text must meet WCAG AA standards for contrast
   - Theme switching must maintain proper contrast ratios

## Deployment Strategy

1. **Feature Flags**
   - Use feature flags to gradually roll out new capabilities
   - Initial deployment will be behind a `hello-world-v2-enabled` flag

2. **Monitoring**
   - Set up error tracking for API endpoints
   - Monitor performance metrics for page load and API response times

3. **Rollback Plan**
   - Maintain ability to revert to previous version if issues arise
   - Document database migration rollback procedures

## Documentation Requirements

1. **User Documentation**
   - Create help text for agent configuration options
   - Provide examples of customization possibilities

2. **Developer Documentation**
   - Document component API and props
   - Provide examples of extending the agent functionality

3. **Maintenance Documentation**
   - Document database schema and relationships
   - Document API endpoints and expected responses 