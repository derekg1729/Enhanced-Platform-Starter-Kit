# Hello World MVP Agent Creation - Implementation Plan

## Overview

This document outlines the step-by-step implementation plan for the Hello World MVP agent creation feature. The implementation will follow the Test-Driven Development (TDD) approach, with tests written before implementation for each component. The plan emphasizes pattern reuse rather than direct component adaptation, recognizing the unique requirements of agent functionality.

## Implementation Phases

### Phase 1: Database Schema and Core Utilities

#### Step 1: Database Schema Implementation
1. Write tests for database schema validation in `tests/unit/schema/agent-schema.test.ts`
   ```typescript
   // Example test snippet
   it('should validate agent schema structure', () => {
     expect(agents.name.name).toBe('name');
     expect(agents.name.notNull).toBe(true);
     // Additional schema validation
   });
   ```

2. Implement agent schema in `lib/schema.ts`:
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

3. Implement API connection schema in `lib/schema.ts`:
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

4. Implement agent message schema in `lib/schema.ts`:
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

5. Update schema relations in `lib/schema.ts`:
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

6. Create database migration script using Drizzle:
   ```bash
   pnpm drizzle-kit generate:pg --schema=./lib/schema.ts
   ```

#### Step 2: Encryption Utilities
1. Write tests for encryption utilities in `tests/unit/encryption.test.ts`:
   ```typescript
   // Example test snippet
   it('should encrypt and decrypt text correctly', () => {
     const originalText = 'test-api-key-12345';
     const encrypted = encrypt(originalText, testKey);
     
     // Encrypted text should be different from original
     expect(encrypted).not.toBe(originalText);
     
     // Should decrypt back to original
     const decrypted = decrypt(encrypted, testKey);
     expect(decrypted).toBe(originalText);
   });
   ```

2. Implement encryption utilities in `lib/encryption.ts`:
   ```typescript
   import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

   const ALGORITHM = 'aes-256-gcm';
   const IV_LENGTH = 16;
   const AUTH_TAG_LENGTH = 16;

   export function encrypt(text: string, key: string): string {
     const iv = randomBytes(IV_LENGTH);
     const cipher = createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
     
     let encrypted = cipher.update(text, 'utf8', 'hex');
     encrypted += cipher.final('hex');
     
     const authTag = cipher.getAuthTag().toString('hex');
     
     // Format: iv:authTag:encryptedData
     return `${iv.toString('hex')}:${authTag}:${encrypted}`;
   }

   export function decrypt(encryptedText: string, key: string): string {
     const [ivHex, authTagHex, encryptedData] = encryptedText.split(':');
     
     if (!ivHex || !authTagHex || !encryptedData) {
       throw new Error('Invalid encrypted text format');
     }
     
     const iv = Buffer.from(ivHex, 'hex');
     const authTag = Buffer.from(authTagHex, 'hex');
     const decipher = createDecipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
     
     decipher.setAuthTag(authTag);
     
     let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
     decrypted += decipher.final('utf8');
     
     return decrypted;
   }
   ```

3. Add environment variable for encryption key in `.env.local.example`:
   ```
   # API Key Encryption
   API_ENCRYPTION_KEY=generate-a-32-byte-hex-key-and-store-securely
   ```

### Phase 2: AI Service Integration

#### Step 1: OpenAI Integration
1. Write tests for OpenAI integration in `tests/unit/openai.test.ts`:
   ```typescript
   // Example test snippet
   it('should generate chat completion successfully', async () => {
     // Mock OpenAI response
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
   ```

2. Implement OpenAI integration in `lib/openai.ts`:
   ```typescript
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

#### Step 2: Anthropic Integration
1. Write tests for Anthropic integration in `tests/unit/anthropic.test.ts`
2. Implement Anthropic integration in `lib/anthropic.ts` (similar to OpenAI implementation)

### Phase 3: Database Operations

#### Step 1: Agent Database Operations
1. Write tests for agent database operations in `tests/unit/agent-db.test.ts`
2. Implement agent database operations in `lib/agent-db.ts`:
   ```typescript
   import { db } from './db';
   import { agents } from './schema';
   import { eq } from 'drizzle-orm';
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

#### Step 2: API Connection Database Operations
1. Write tests for API connection database operations in `tests/unit/api-connection-db.test.ts`
2. Implement API connection database operations in `lib/api-connection-db.ts`

#### Step 3: Agent Message Database Operations
1. Write tests for agent message database operations in `tests/unit/agent-message-db.test.ts`
2. Implement agent message database operations in `lib/agent-message-db.ts`

### Phase 4: API Routes

#### Step 1: Agent API Routes
1. Write tests for agent API routes in `tests/integration/api/agents.test.ts`
2. Implement GET `/api/agents/route.ts`:
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

3. Implement remaining agent API routes:
   - `app/api/agents/[id]/route.ts` (GET, PUT, DELETE)
   - `app/api/agents/[id]/chat/route.ts` (POST with streaming)

#### Step 2: API Connection Routes
1. Write tests for API connection routes in `tests/integration/api/api-connections.test.ts`
2. Implement API connection routes:
   - `app/api/api-connections/route.ts` (GET, POST)
   - `app/api/api-connections/[id]/route.ts` (DELETE)

### Phase 5: UI Components

#### Step 1: Agent Card Component
1. Write tests for AgentCard component in `tests/unit/components/agent/AgentCard.test.tsx`
2. Implement AgentCard component in `components/agent/AgentCard.tsx`:
   ```typescript
   import { SelectAgent } from "@/lib/schema";
   import { Brain, Trash } from "lucide-react";
   import Link from "next/link";

   export default function AgentCard({ 
     agent, 
     onDelete,
     onChat 
   }: { 
     agent: SelectAgent;
     onDelete: (id: string) => void;
     onChat: (id: string) => void;
   }) {
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
             onClick={() => onChat(agent.id)}
             className="flex items-center rounded-md bg-blue-100 px-2 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:bg-opacity-50 dark:text-blue-400 dark:hover:bg-blue-800"
           >
             <Brain height={16} className="mr-1" />
             <p>Chat</p>
           </button>
           <button
             onClick={() => {
               if (window.confirm("Are you sure you want to delete this agent?")) {
                 onDelete(agent.id);
               }
             }}
             className="flex items-center rounded-md bg-red-100 px-2 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900 dark:bg-opacity-50 dark:text-red-400 dark:hover:bg-red-800"
           >
             <Trash height={16} className="mr-1" />
             <p>Delete</p>
           </button>
         </div>
       </div>
     );
   }
   ```

#### Step 2: Agents List Component
1. Write tests for Agents component in `tests/unit/components/agent/Agents.test.tsx`
2. Implement Agents component in `components/agent/Agents.tsx`:
   ```typescript
   import { getSession } from "@/lib/auth";
   import db from "@/lib/db";
   import Image from "next/image";
   import { redirect } from "next/navigation";
   import AgentCard from "./AgentCard";

   export default async function Agents({ limit }: { limit?: number }) {
     const session = await getSession();
     if (!session) {
       redirect("/login");
     }

     const agents = await db.query.agents.findMany({
       where: (agents, { eq }) => eq(agents.userId, session.user.id),
       orderBy: (agents, { desc }) => desc(agents.createdAt),
       ...(limit ? { limit } : {}),
     });

     return agents.length > 0 ? (
       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
         {agents.map((agent) => (
           <AgentCard 
             key={agent.id} 
             agent={agent} 
             onDelete={(id) => {/* Client component will handle */}} 
             onChat={(id) => {/* Client component will handle */}}
           />
         ))}
       </div>
     ) : (
       <div className="mt-20 flex flex-col items-center space-x-4">
         <h1 className="font-cal text-4xl">No Agents Yet</h1>
         <Image
           alt="missing agent"
           src="https://illustrations.popsy.co/gray/artificial-intelligence.svg"
           width={400}
           height={400}
         />
         <p className="text-lg text-stone-500">
           You do not have any agents yet. Create one to get started.
         </p>
       </div>
     );
   }
   ```

#### Step 3: Create Agent Button
1. Write tests for CreateAgentButton component in `tests/unit/components/agent/CreateAgentButton.test.tsx`
2. Implement CreateAgentButton component in `components/agent/CreateAgentButton.tsx`:
   ```typescript
   "use client";

   import { useModal } from "@/components/modal/provider";
   import { ReactNode } from "react";

   export default function CreateAgentButton({
     children,
   }: {
     children: ReactNode;
   }) {
     const modal = useModal();
     return (
       <button
         onClick={() => {
           modal?.show(children);
         }}
         className="rounded-lg border border-black bg-black px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800"
       >
         Create New Agent
       </button>
     );
   }
   ```

#### Step 4: Create Agent Modal
1. Write tests for CreateAgentModal component in `tests/unit/components/modal/create-agent.test.tsx`
2. Implement CreateAgentModal component in `components/modal/create-agent.tsx`

#### Step 5: API Key Management Components
1. Write tests for API key management components
2. Implement API key management components:
   - `components/agent/ApiKeyForm.tsx`
   - `components/agent/ApiConnectionsList.tsx`

#### Step 6: Chat Interface Components
1. Write tests for chat interface components
2. Implement chat interface components:
   - `components/agent/ChatInterface.tsx`
   - `components/agent/ChatMessages.tsx`
   - `components/agent/ChatInput.tsx`

### Phase 6: Pages and Navigation

#### Step 1: Update Navigation
1. Update `components/nav.tsx` to include agent-related links:
   ```typescript
   // Add to the tabs array in the useMemo hook
   {
     name: "Agents",
     href: "/agents",
     isActive: segments[0] === "agents",
     icon: <Brain width={18} />,
   },
   ```

#### Step 2: Implement Agent Pages
1. Create agents dashboard page in `app/app/(dashboard)/agents/page.tsx`
2. Create agent detail page in `app/app/(dashboard)/agents/[id]/page.tsx`
3. Create agent creation page in `app/app/(dashboard)/agents/create/page.tsx`
4. Create API connections page in `app/app/(dashboard)/api-connections/page.tsx`

### Phase 7: Testing and Refinement

#### Step 1: Integration Testing
1. Write integration tests for complete user flows
2. Test API key management flow
3. Test agent creation flow
4. Test agent chat flow
5. Test agent management flow

#### Step 2: End-to-End Testing
1. Write end-to-end tests for complete user journeys
2. Test the complete user journey from API key creation to agent chat

## File Structure Summary

### New Files to Create:
- **Database and Utilities**:
  - `lib/encryption.ts` - Encryption utilities
  - `lib/openai.ts` - OpenAI integration
  - `lib/anthropic.ts` - Anthropic integration
  - `lib/agent-db.ts` - Agent database operations
  - `lib/api-connection-db.ts` - API connection database operations
  - `lib/agent-message-db.ts` - Agent message database operations

- **API Routes**:
  - `app/api/agents/route.ts` - Agent CRUD endpoints
  - `app/api/agents/[id]/route.ts` - Single agent operations
  - `app/api/agents/[id]/chat/route.ts` - Chat functionality
  - `app/api/api-connections/route.ts` - API connection endpoints
  - `app/api/api-connections/[id]/route.ts` - Single API connection operations

- **UI Components**:
  - `components/agent/AgentCard.tsx` - Display agent information
  - `components/agent/Agents.tsx` - List of agents
  - `components/agent/CreateAgentButton.tsx` - Button to create agent
  - `components/modal/create-agent.tsx` - Agent creation modal
  - `components/agent/ApiKeyForm.tsx` - Form for API keys
  - `components/agent/ApiConnectionsList.tsx` - List of API connections
  - `components/agent/ChatInterface.tsx` - Chat container
  - `components/agent/ChatMessages.tsx` - Display messages
  - `components/agent/ChatInput.tsx` - Send messages

- **Pages**:
  - `app/app/(dashboard)/agents/page.tsx` - Agents dashboard
  - `app/app/(dashboard)/agents/[id]/page.tsx` - Agent details
  - `app/app/(dashboard)/agents/create/page.tsx` - Create agent
  - `app/app/(dashboard)/api-connections/page.tsx` - API connections

### Files to Modify:
- `lib/schema.ts` - Add agent-related schemas and update relations
- `components/nav.tsx` - Add agent-related navigation links

## Dependencies Between Components

1. **Database Schema** → Database Operations → API Routes → UI Components → Pages
2. **Encryption Utilities** → API Connection Operations → API Connection Routes → API Key Management Components
3. **AI Service Integration** → Chat API Routes → Chat Interface Components

## Timeline

- **Phase 1 (Database Schema and Core Utilities)**: 2 days
- **Phase 2 (AI Service Integration)**: 1 day
- **Phase 3 (Database Operations)**: 2 days
- **Phase 4 (API Routes)**: 2 days
- **Phase 5 (UI Components)**: 3 days
- **Phase 6 (Pages and Navigation)**: 1 day
- **Phase 7 (Testing and Refinement)**: 3 days

Total estimated time: 2 weeks

## Success Criteria

1. All tests pass with at least 80% coverage
2. Feature meets all requirements in the design documents
3. API keys are securely stored and managed
4. Chat functionality works with streaming responses
5. UI is responsive and accessible
6. Multi-tenant isolation is properly implemented
7. Error handling is comprehensive and user-friendly

## Conclusion

This implementation plan provides a structured approach to developing the Hello World MVP agent creation feature. By following this plan and the TDD approach, we can ensure a high-quality implementation that meets all requirements while maintaining consistency with the existing application architecture. 