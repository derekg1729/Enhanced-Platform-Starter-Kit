# Hello World MVP Agent Creation - Technical Implementation

## Component Implementation Strategy

### Pattern Inspiration vs. Direct Implementation

Rather than directly adapting existing components, we'll create new agent-specific components that are inspired by existing patterns but tailored to agent functionality:

| Existing Pattern | New Component | Implementation Approach |
|-----------------|-----------------|------------------------|
| Card layout patterns | `components/agent/AgentCard.tsx` | New component with agent-specific fields and actions |
| Dashboard layout | `app/app/(dashboard)/agents/page.tsx` | New server component with agent-specific data fetching |
| Form patterns | `components/agent/AgentCreationForm.tsx` | New client component with agent-specific fields and validation |
| Empty/loading states | Reuse `components/placeholder-card.tsx` | Direct reuse where appropriate |
| Error handling | Follow existing error handling patterns | Consistent approach with agent-specific error messages |

### New Components Needed

| Component | Purpose | Client/Server | Key Considerations |
|-----------|---------|---------------|-------------------|
| `components/agent/AgentCard.tsx` | Display agent info | Client | Interactive elements for chat, edit, delete |
| `components/agent/AgentList.tsx` | List user's agents | Client | Handles loading, empty states, and pagination |
| `components/agent/CreateAgentButton.tsx` | Button to create agent | Client | Opens modal for agent creation |
| `components/agent/AgentCreationForm.tsx` | Create/edit agents | Client | Form validation, model selection, API connection integration |
| `components/agent/ApiKeyForm.tsx` | Manage API keys | Client | Secure input handling, validation |
| `components/agent/ApiConnectionsList.tsx` | List API connections | Client | Display API connections with masked keys |
| `components/agent/ChatInterface.tsx` | Chat container | Server | Provides layout and data fetching |
| `components/agent/ChatMessages.tsx` | Display messages | Client | Renders message history with proper styling |
| `components/agent/ChatInput.tsx` | Send messages | Client | Handles message input and submission |
| `components/agent/ModelSelector.tsx` | Select AI model | Client | Dynamic options based on available API connections |
| `components/modal/create-agent.tsx` | Agent creation modal | Client | Contains AgentCreationForm |

## Database Schema

The new schema will follow existing patterns for relations, indexes, and security:

### Agent Table
```typescript
export const agents = pgTable(
  "agents",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    name: text("name").notNull(),
    description: text("description"),
    systemPrompt: text("system_prompt").notNull(),
    model: text("model").notNull().default("gpt-3.5-turbo"),
    temperature: numeric("temperature").notNull().default("0.7"),
    maxTokens: integer("max_tokens"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (table) => {
    return {
      userIdIdx: index().on(table.userId),
    };
  }
);
```

### API Connection Table
```typescript
export const apiConnections = pgTable(
  "api_connections",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    name: text("name").notNull(),
    service: text("service").notNull(), // 'openai' or 'anthropic'
    apiKey: text("api_key").notNull(), // Encrypted
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      userIdIdx: index().on(table.userId),
      serviceUserIdIdx: index().on(table.service, table.userId),
    };
  }
);
```

### Agent Message Table
```typescript
export const agentMessages = pgTable(
  "agent_messages",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade", onUpdate: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    role: text("role").notNull(), // 'user' or 'assistant'
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    conversationId: text("conversation_id").notNull(),
  },
  (table) => {
    return {
      agentIdIdx: index().on(table.agentId),
      userIdIdx: index().on(table.userId),
      conversationIdIdx: index().on(table.conversationId),
      createdAtIdx: index().on(table.createdAt),
    };
  }
);
```

### Schema Relations
```typescript
export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, { references: [users.id], fields: [agents.userId] }),
  messages: many(agentMessages),
}));

export const apiConnectionsRelations = relations(apiConnections, ({ one }) => ({
  user: one(users, { references: [users.id], fields: [apiConnections.userId] }),
}));

export const agentMessagesRelations = relations(agentMessages, ({ one }) => ({
  agent: one(agents, { references: [agents.id], fields: [agentMessages.agentId] }),
  user: one(users, { references: [users.id], fields: [agentMessages.userId] }),
}));

// Update existing userRelations
export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  sites: many(sites),
  posts: many(posts),
  agents: many(agents),
  apiConnections: many(apiConnections),
  agentMessages: many(agentMessages),
}));
```

## API Routes

### GET /api/agents
```typescript
import { getSession } from "@/lib/auth";
import { getAgentsByUserId } from "@/lib/agent-db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const agents = await getAgentsByUserId(session.user.id);
    return NextResponse.json(agents);
  } catch (error) {
    console.error(error);
    return new NextResponse("Error fetching agents", { status: 500 });
  }
}
```

### POST /api/agents
```typescript
import { getSession } from "@/lib/auth";
import { createAgent } from "@/lib/agent-db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, systemPrompt, model, temperature, maxTokens } = body;
    
    if (!name || !systemPrompt || !model) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    
    const agent = await createAgent(session.user.id, {
      name,
      description,
      systemPrompt,
      model,
      temperature,
      maxTokens,
    });
    
    return NextResponse.json(agent);
  } catch (error) {
    console.error(error);
    return new NextResponse("Error creating agent", { status: 500 });
  }
}
```

### GET /api/agents/[id]
- Server-side authenticated route
- Returns a specific agent by ID
- Verifies user has access to the agent
- Returns agent object with related data

### PUT /api/agents/[id]
- Server-side authenticated route
- Updates a specific agent
- Validates input data
- Verifies user has access to the agent
- Returns updated agent object

### DELETE /api/agents/[id]
- Server-side authenticated route
- Deletes a specific agent
- Verifies user has access to the agent
- Returns success message

### GET /api/api-connections
- Server-side authenticated route
- Returns all API connections for the authenticated user
- Masks API key data in the response
- Implements proper pagination

### POST /api/api-connections
- Server-side authenticated route
- Creates a new API connection
- Validates input data
- Encrypts API key before storage
- Associates with the authenticated user
- Returns created API connection object (with masked API key)

### DELETE /api/api-connections/[id]
- Server-side authenticated route
- Deletes a specific API connection
- Verifies user has access to the API connection
- Returns success message

### POST /api/agents/[id]/chat
```typescript
import { getSession } from "@/lib/auth";
import { getAgentById } from "@/lib/agent-db";
import { getApiConnectionByService } from "@/lib/api-connection-db";
import { createAgentMessage } from "@/lib/agent-message-db";
import { generateStreamingChatCompletion } from "@/lib/openai";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = params;
    const agent = await getAgentById(id, session.user.id);
    
    if (!agent) {
      return new NextResponse("Agent not found", { status: 404 });
    }
    
    const body = await request.json();
    const { message, conversationId } = body;
    
    if (!message) {
      return new NextResponse("Message is required", { status: 400 });
    }
    
    // Create a new conversation ID if not provided
    const chatConversationId = conversationId || createId();
    
    // Save user message
    await createAgentMessage({
      agentId: id,
      userId: session.user.id,
      role: "user",
      content: message,
      conversationId: chatConversationId,
    });
    
    // Get previous messages for context
    const previousMessages = await getAgentMessages(id, chatConversationId);
    
    // Format messages for AI service
    const formattedMessages = [
      { role: "system", content: agent.systemPrompt },
      ...previousMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];
    
    // Get API connection for the model's service
    const service = agent.model.startsWith("gpt") ? "openai" : "anthropic";
    const apiConnection = await getApiConnectionByService(service, session.user.id);
    
    if (!apiConnection) {
      return new NextResponse(`No API key found for ${service}`, { status: 400 });
    }
    
    // Create stream
    const stream = await generateStreamingChatCompletion(
      formattedMessages,
      agent.model,
      parseFloat(agent.temperature),
      agent.maxTokens,
      apiConnection.apiKey,
      process.env.API_ENCRYPTION_KEY!
    );
    
    // Set up streaming response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";
        
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              fullResponse += content;
            }
          }
          
          // Save assistant message
          await createAgentMessage({
            agentId: id,
            userId: session.user.id,
            role: "assistant",
            content: fullResponse,
            conversationId: chatConversationId,
          });
          
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } catch (error) {
          console.error("Error generating response:", error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Error generating response" })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });
    
    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error processing chat", { status: 500 });
  }
}
```

## Encryption Utilities

```typescript
// lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export function encrypt(text: string, key: string): string {
  if (!key || key.length !== 64) {
    throw new Error('Invalid encryption key. Must be a 32-byte hex string (64 characters)');
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string, key: string): string {
  if (!key || key.length !== 64) {
    throw new Error('Invalid encryption key. Must be a 32-byte hex string (64 characters)');
  }

  const [ivHex, authTagHex, encryptedData] = encryptedText.split(':');
  
  if (!ivHex || !authTagHex || !encryptedData) {
    throw new Error('Invalid encrypted text format');
  }
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
  
  decipher.setAuthTag(authTag);
  
  try {
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed. The key may be incorrect or the data may be corrupted.');
  }
}

// Helper function to generate a secure encryption key
export function generateEncryptionKey(): string {
  return randomBytes(32).toString('hex');
}
```

## Server/Client Component Separation

### Server Components
- `app/app/(dashboard)/agents/page.tsx`: Main agents listing page
  ```typescript
  import { Suspense } from "react";
  import { getSession } from "@/lib/auth";
  import Agents from "@/components/agent/Agents";
  import CreateAgentButton from "@/components/agent/CreateAgentButton";
  import CreateAgentModal from "@/components/modal/create-agent";
  import { redirect } from "next/navigation";
  
  export default async function AgentsPage() {
    const session = await getSession();
    if (!session) {
      redirect("/login");
    }
    
    return (
      <div className="flex flex-col items-center justify-center py-10 md:py-20">
        <div className="w-full max-w-screen-xl px-2.5 lg:px-20">
          <div className="flex flex-col items-center space-y-8 text-center sm:space-y-12">
            <h1 className="font-cal text-3xl font-bold dark:text-white sm:text-5xl">
              Your AI Agents
            </h1>
            <CreateAgentButton>
              <CreateAgentModal />
            </CreateAgentButton>
          </div>
          <div className="my-10 w-full">
            <Suspense fallback={<div>Loading agents...</div>}>
              <Agents />
            </Suspense>
          </div>
        </div>
      </div>
    );
  }
  ```

- `app/app/(dashboard)/agents/[id]/page.tsx`: Agent detail page
- `app/app/(dashboard)/api-connections/page.tsx`: API connections management page

### Client Components
- `components/agent/AgentCard.tsx`: Interactive agent card
  ```typescript
  "use client";
  
  import { SelectAgent } from "@/lib/schema";
  import { Brain, Trash } from "lucide-react";
  import Link from "next/link";
  import { useState } from "react";
  import { useRouter } from "next/navigation";
  
  export default function AgentCard({ 
    agent 
  }: { 
    agent: SelectAgent;
  }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);
    
    const handleDelete = async () => {
      if (!window.confirm("Are you sure you want to delete this agent?")) {
        return;
      }
      
      setDeleting(true);
      
      try {
        const response = await fetch(`/api/agents/${agent.id}`, {
          method: "DELETE",
        });
        
        if (!response.ok) {
          throw new Error("Failed to delete agent");
        }
        
        router.refresh();
      } catch (error) {
        console.error(error);
        alert("Failed to delete agent");
      } finally {
        setDeleting(false);
      }
    };
    
    const handleChat = () => {
      router.push(`/agent/${agent.id}/chat`);
    };
    
    return (
      <div className="relative rounded-lg border border-stone-200 pb-10 shadow-md transition-all hover:shadow-xl dark:border-stone-700 dark:hover:border-white">
        <Link
          href={`/agent/${agent.id}`}
          className="flex flex-col overflow-hidden rounded-lg"
        >
          <div className="border-t border-stone-200 p-4 dark:border-stone-700">
            <h3 className="my-0 truncate font-cal text-xl font-bold tracking-wide dark:text-white">
              {agent.name}
            </h3>
            <p className="mt-2 line-clamp-1 text-sm font-normal leading-snug text-stone-500 dark:text-stone-400">
              {agent.description || "No description provided"}
            </p>
            <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
              Model: {agent.model}
            </p>
          </div>
        </Link>
        <div className="absolute bottom-4 flex w-full justify-between space-x-4 px-4">
          <button
            onClick={handleChat}
            className="flex items-center rounded-md bg-blue-100 px-2 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:bg-opacity-50 dark:text-blue-400 dark:hover:bg-blue-800"
            disabled={deleting}
          >
            <Brain height={16} className="mr-1" />
            <p>Chat</p>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center rounded-md bg-red-100 px-2 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900 dark:bg-opacity-50 dark:text-red-400 dark:hover:bg-red-800"
            disabled={deleting}
          >
            <Trash height={16} className="mr-1" />
            <p>{deleting ? "Deleting..." : "Delete"}</p>
          </button>
        </div>
      </div>
    );
  }
  ```

- `components/agent/AgentCreationForm.tsx`: Form with state management
- `components/agent/ApiKeyForm.tsx`: Form with secure input handling
- `components/agent/ChatMessages.tsx`: Interactive message display
- `components/agent/ChatInput.tsx`: Interactive message input

## AI Service Integration

### OpenAI Integration
```typescript
// lib/openai.ts
import OpenAI from 'openai';
import { decrypt } from './encryption';

export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string,
  temperature: number,
  maxTokens: number | undefined,
  apiKey: string,
  encryptionKey: string
) {
  try {
    const decryptedApiKey = decrypt(apiKey, encryptionKey);
    const openai = new OpenAI({ apiKey: decryptedApiKey });
    
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating OpenAI chat completion:', error);
    throw new Error('Failed to generate AI response');
  }
}

export async function generateStreamingChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string,
  temperature: number,
  maxTokens: number | undefined,
  apiKey: string,
  encryptionKey: string
) {
  try {
    const decryptedApiKey = decrypt(apiKey, encryptionKey);
    const openai = new OpenAI({ apiKey: decryptedApiKey });
    
    const stream = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });
    
    return stream;
  } catch (error) {
    console.error('Error generating OpenAI streaming chat completion:', error);
    throw new Error('Failed to generate streaming AI response');
  }
}
```

### Anthropic Integration
```typescript
// lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk';
import { decrypt } from './encryption';

export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string,
  temperature: number,
  maxTokens: number | undefined,
  apiKey: string,
  encryptionKey: string
) {
  try {
    const decryptedApiKey = decrypt(apiKey, encryptionKey);
    const anthropic = new Anthropic({ apiKey: decryptedApiKey });
    
    // Convert messages to Anthropic format
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));
    
    const response = await anthropic.messages.create({
      model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
    });
    
    return response.content[0].text;
  } catch (error) {
    console.error('Error generating Anthropic chat completion:', error);
    throw new Error('Failed to generate AI response');
  }
}

export async function generateStreamingChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string,
  temperature: number,
  maxTokens: number | undefined,
  apiKey: string,
  encryptionKey: string
) {
  try {
    const decryptedApiKey = decrypt(apiKey, encryptionKey);
    const anthropic = new Anthropic({ apiKey: decryptedApiKey });
    
    // Convert messages to Anthropic format
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));
    
    const stream = await anthropic.messages.create({
      model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });
    
    return stream;
  } catch (error) {
    console.error('Error generating Anthropic streaming chat completion:', error);
    throw new Error('Failed to generate streaming AI response');
  }
}
```

## Database Operations

### Agent Database Operations
```typescript
// lib/agent-db.ts
import { db } from './db';
import { agents } from './schema';
import { eq, and } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export async function getAgentsByUserId(userId: string) {
  return db.query.agents.findMany({
    where: (agents, { eq }) => eq(agents.userId, userId),
    orderBy: (agents, { desc }) => desc(agents.createdAt),
  });
}

export async function getAgentById(id: string, userId: string) {
  return db.query.agents.findFirst({
    where: (agents, { and, eq }) => 
      and(eq(agents.id, id), eq(agents.userId, userId)),
  });
}

export async function createAgent(userId: string, data: {
  name: string;
  description?: string;
  systemPrompt: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const id = createId();
  
  await db.insert(agents).values({
    id,
    userId,
    name: data.name,
    description: data.description,
    systemPrompt: data.systemPrompt,
    model: data.model,
    temperature: data.temperature ? data.temperature.toString() : "0.7",
    maxTokens: data.maxTokens,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  return getAgentById(id, userId);
}

export async function updateAgent(id: string, userId: string, data: {
  name?: string;
  description?: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  await db.update(agents)
    .set({
      ...data,
      temperature: data.temperature ? data.temperature.toString() : undefined,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(agents.id, id),
        eq(agents.userId, userId)
      )
    );
  
  return getAgentById(id, userId);
}

export async function deleteAgent(id: string, userId: string) {
  const result = await db.delete(agents)
    .where(
      and(
        eq(agents.id, id),
        eq(agents.userId, userId)
      )
    );
  
  return result.rowCount > 0;
}
```

## Testing Implementation

### Unit Tests
- Test encryption/decryption utilities
- Test AI service integration with mocked responses
- Test component rendering and interactions
- Test form validation

### Integration Tests
- Test API routes with authenticated requests
- Test database operations with test database
- Test end-to-end flows with mocked AI services

### Security Tests
- Test access control for agents and API connections
- Test API key encryption/decryption
- Test multi-tenant isolation 