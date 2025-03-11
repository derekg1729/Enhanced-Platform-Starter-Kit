# Hello World Agent

This document outlines the minimal implementation of our first agent on the Agent Platform.

## Overview

The Hello World agent is the simplest possible implementation that demonstrates the core functionality of the Agent Platform. It serves as a proof of concept and foundation for more complex agents.

## Key Features

- Simple chat interface
- Basic OpenAI integration
- Minimal structured input/output
- Observability via Helicone
- Multi-tenant isolation

## Implementation

### 1. Data Model

```typescript
// Simplified agent schema for v1
export const agents = pgTable(
  "agents",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    name: text("name").notNull(),
    description: text("description"),
    prompt: text("prompt").notNull(),
    model: text("model").default("gpt-3.5-turbo").notNull(),
    temperature: real("temperature").default(0.7),
    userId: text("userId").references(() => users.id),
  }
);

// Minimal conversation schema
export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    title: text("title").default("New Conversation"),
    agentId: text("agentId").references(() => agents.id),
    userId: text("userId").references(() => users.id),
  }
);

// Minimal message schema
export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    role: text("role").notNull(), // 'user' or 'assistant'
    content: text("content").notNull(),
    conversationId: text("conversationId").references(() => conversations.id),
  }
);
```

### 2. AI Service Integration

```typescript
// Simple OpenAI integration with Helicone for observability
export async function generateResponse(prompt, userMessage, userId) {
  // Configure Helicone for observability
  const headers = {
    'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
    'Helicone-User-Id': userId
  };
  
  const response = await fetch('https://oai.hconeai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      ...headers
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userMessage }
      ]
    })
  });
  
  return response.json();
}
```

### 3. User Interface

#### Chat Interface
- Simple message input
- Message history display
- Basic styling with Tailwind CSS

```tsx
// Simplified chat component
export default function AgentChat({ agentId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  const sendMessage = async () => {
    // Add user message to state
    setMessages([...messages, { role: 'user', content: input }]);
    
    // Call API to get response
    const response = await fetch(`/api/agents/${agentId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message: input })
    });
    
    const data = await response.json();
    
    // Add assistant message to state
    setMessages([...messages, { role: 'assistant', content: data.message }]);
    setInput('');
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, i) => (
          <div key={i} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {message.content}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t p-4">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded-l-lg p-2"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white p-2 rounded-r-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### Agent Creation Form
- Name and description inputs
- Prompt template editor
- Model selection dropdown

```tsx
// Simplified agent creation form
export default function CreateAgent() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('You are a helpful assistant.');
  const [model, setModel] = useState('gpt-3.5-turbo');
  
  const createAgent = async () => {
    const response = await fetch('/api/agents', {
      method: 'POST',
      body: JSON.stringify({ name, description, prompt, model })
    });
    
    if (response.ok) {
      // Redirect to agent page
      router.push('/agents');
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Agent</h1>
      <div className="space-y-4">
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded p-2 h-24"
          />
        </div>
        <div>
          <label className="block mb-1">Prompt Template</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full border rounded p-2 h-32 font-mono"
          />
        </div>
        <div>
          <label className="block mb-1">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
          </select>
        </div>
        <button
          onClick={createAgent}
          className="bg-blue-500 text-white p-2 rounded w-full"
        >
          Create Agent
        </button>
      </div>
    </div>
  );
}
```

## Observability Integration

For v1, we'll use Helicone for basic observability:

1. Track all API calls to OpenAI
2. Monitor token usage and costs
3. View basic performance metrics
4. Analyze conversation patterns

## Future Integration Plans

While the Hello World agent focuses on basic AI service integration, future versions will add:

1. Third-party service integrations (Notion, Google Docs, etc.)
2. Integration hubs (Zapier, Make.com)
3. Enhanced observability with Langfuse
4. Structured input/output validation
5. **Frictionless integration** with one-click authentication and automated API key management
6. **Community collaboration features** for sharing, forking, and monetizing agents

## Implementation Plan

1. Create database migrations for minimal schema
2. Build agent creation form
3. Implement chat interface
4. Set up OpenAI integration with Helicone
5. Add basic multi-tenant isolation
6. Test end-to-end functionality
7. **Add OAuth integration foundation** for future frictionless integration

## Next Steps

After completing the Hello World agent:

1. Add structured input/output validation
2. Implement feedback collection
3. Enhance the UI with better conversation management
4. Prepare for containerization in v2
5. **Design community collaboration interfaces**
6. **Implement simplified API connection flows** 