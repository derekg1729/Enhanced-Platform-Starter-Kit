# Agent Database Schema

This document defines the database schema for agents in the Agent Platform, including the necessary tables, relationships, and security policies for multi-tenant isolation.

## Overview

The agent schema is designed with the following goals:

1. **Multi-tenant Isolation**: Ensure complete data separation between tenants
2. **Flexibility**: Support various agent configurations and capabilities
3. **Performance**: Optimize for efficient queries and scalability
4. **Security**: Protect sensitive information like API keys
5. **Extensibility**: Allow for future enhancements without major schema changes

## Tables

### agents

The main table for storing agent metadata.

```typescript
export const agents = pgTable(
  "agents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
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
      nameIdx: index().on(table.name),
    };
  }
);
```

### agent_api_connections

Table for storing connections between agents and API keys.

```typescript
export const agentApiConnections = pgTable(
  "agent_api_connections",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade", onUpdate: "cascade" }),
    apiConnectionId: text("api_connection_id")
      .notNull()
      .references(() => apiConnections.id, { onDelete: "cascade", onUpdate: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      agentIdIdx: index().on(table.agentId),
      apiConnectionIdIdx: index().on(table.apiConnectionId),
      uniqueConnection: uniqueIndex().on(table.agentId, table.apiConnectionId),
    };
  }
);
```

### agent_messages

Table for storing conversation history between users and agents.

```typescript
export const agentMessages = pgTable(
  "agent_messages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
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
    metadata: jsonb("metadata"),
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

### agent_feedback

Table for storing user feedback on agent responses.

```typescript
export const agentFeedback = pgTable(
  "agent_feedback",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    messageId: text("message_id")
      .notNull()
      .references(() => agentMessages.id, { onDelete: "cascade", onUpdate: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    rating: integer("rating").notNull(), // 1 for thumbs up, 0 for thumbs down
    comment: text("comment"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => {
    return {
      messageIdIdx: index().on(table.messageId),
      userIdIdx: index().on(table.userId),
    };
  }
);
```

### api_connections

Table for storing API connection details.

```typescript
export const apiConnections = pgTable(
  "api_connections",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    service: text("service").notNull(), // e.g., 'openai', 'github', etc.
    apiKey: text("api_key").notNull(), // Encrypted
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
    metadata: jsonb("metadata"),
  },
  (table) => {
    return {
      userIdIdx: index().on(table.userId),
      serviceIdx: index().on(table.service),
    };
  }
);
```

## Relationships

```typescript
export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, { references: [users.id], fields: [agents.userId] }),
  apiConnections: many(agentApiConnections),
  messages: many(agentMessages),
}));

export const agentApiConnectionsRelations = relations(agentApiConnections, ({ one }) => ({
  agent: one(agents, { references: [agents.id], fields: [agentApiConnections.agentId] }),
  apiConnection: one(apiConnections, { references: [apiConnections.id], fields: [agentApiConnections.apiConnectionId] }),
}));

export const agentMessagesRelations = relations(agentMessages, ({ one, many }) => ({
  agent: one(agents, { references: [agents.id], fields: [agentMessages.agentId] }),
  user: one(users, { references: [users.id], fields: [agentMessages.userId] }),
  feedback: many(agentFeedback),
}));

export const agentFeedbackRelations = relations(agentFeedback, ({ one }) => ({
  message: one(agentMessages, { references: [agentMessages.id], fields: [agentFeedback.messageId] }),
  user: one(users, { references: [users.id], fields: [agentFeedback.userId] }),
}));

export const apiConnectionsRelations = relations(apiConnections, ({ one, many }) => ({
  user: one(users, { references: [users.id], fields: [apiConnections.userId] }),
  agents: many(agentApiConnections),
}));

export const userRelations = relations(users, ({ many }) => ({
  agents: many(agents),
  apiConnections: many(apiConnections),
  agentMessages: many(agentMessages),
  agentFeedback: many(agentFeedback),
}));
```

## Row-Level Security Policies

To ensure proper multi-tenant isolation, we'll implement row-level security policies on all agent-related tables.

### agents Table Policy

```sql
-- Allow users to see only their own agents
CREATE POLICY agents_isolation_policy ON agents
    USING (user_id = current_user_id());

-- Enable row-level security on the agents table
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
```

### agent_api_connections Table Policy

```sql
-- Allow users to see only connections for their own agents
CREATE POLICY agent_api_connections_isolation_policy ON agent_api_connections
    USING (agent_id IN (SELECT id FROM agents WHERE user_id = current_user_id()));

-- Enable row-level security on the agent_api_connections table
ALTER TABLE agent_api_connections ENABLE ROW LEVEL SECURITY;
```

### agent_messages Table Policy

```sql
-- Allow users to see only messages for their own agents
CREATE POLICY agent_messages_isolation_policy ON agent_messages
    USING (user_id = current_user_id() OR agent_id IN (SELECT id FROM agents WHERE user_id = current_user_id()));

-- Enable row-level security on the agent_messages table
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
```

### agent_feedback Table Policy

```sql
-- Allow users to see only feedback for their own agents' messages
CREATE POLICY agent_feedback_isolation_policy ON agent_feedback
    USING (user_id = current_user_id() OR message_id IN (
        SELECT id FROM agent_messages WHERE agent_id IN (
            SELECT id FROM agents WHERE user_id = current_user_id()
        )
    ));

-- Enable row-level security on the agent_feedback table
ALTER TABLE agent_feedback ENABLE ROW LEVEL SECURITY;
```

### api_connections Table Policy

```sql
-- Allow users to see only their own API connections
CREATE POLICY api_connections_isolation_policy ON api_connections
    USING (user_id = current_user_id());

-- Enable row-level security on the api_connections table
ALTER TABLE api_connections ENABLE ROW LEVEL SECURITY;
```

## API Key Encryption

For security, API keys will be encrypted before storage and decrypted when needed. We'll use the following approach:

1. **Encryption at Rest**: API keys will be encrypted using a strong encryption algorithm (AES-256-GCM) before being stored in the database.
2. **Key Management**: The encryption key will be stored securely in environment variables, not in the database.
3. **Decryption on Use**: Keys will only be decrypted when needed for API calls, and never exposed to the client.

Example encryption/decryption utility:

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const ALGORITHM = 'aes-256-gcm';

export function encryptApiKey(apiKey: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Store IV and auth tag with the encrypted data
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptApiKey(encryptedData: string): string {
  const [ivHex, authTagHex, encryptedHex] = encryptedData.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

## Migration Scripts

The following migration script will create the necessary tables and security policies:

```typescript
import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, numeric, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';

export async function up(db) {
  // Create tables
  await db.execute(sql`
    CREATE TABLE agents (
      id TEXT PRIMARY KEY DEFAULT cuid(),
      name TEXT NOT NULL,
      description TEXT,
      system_prompt TEXT NOT NULL,
      model TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
      temperature NUMERIC NOT NULL DEFAULT 0.7,
      max_tokens INTEGER,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
    );
    
    CREATE INDEX agents_user_id_idx ON agents(user_id);
    CREATE INDEX agents_name_idx ON agents(name);
    
    CREATE TABLE api_connections (
      id TEXT PRIMARY KEY DEFAULT cuid(),
      name TEXT NOT NULL,
      service TEXT NOT NULL,
      api_key TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      metadata JSONB
    );
    
    CREATE INDEX api_connections_user_id_idx ON api_connections(user_id);
    CREATE INDEX api_connections_service_idx ON api_connections(service);
    
    CREATE TABLE agent_api_connections (
      id TEXT PRIMARY KEY DEFAULT cuid(),
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE ON UPDATE CASCADE,
      api_connection_id TEXT NOT NULL REFERENCES api_connections(id) ON DELETE CASCADE ON UPDATE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
    
    CREATE INDEX agent_api_connections_agent_id_idx ON agent_api_connections(agent_id);
    CREATE INDEX agent_api_connections_api_connection_id_idx ON agent_api_connections(api_connection_id);
    CREATE UNIQUE INDEX agent_api_connections_unique_connection_idx ON agent_api_connections(agent_id, api_connection_id);
    
    CREATE TABLE agent_messages (
      id TEXT PRIMARY KEY DEFAULT cuid(),
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE ON UPDATE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      conversation_id TEXT NOT NULL,
      metadata JSONB
    );
    
    CREATE INDEX agent_messages_agent_id_idx ON agent_messages(agent_id);
    CREATE INDEX agent_messages_user_id_idx ON agent_messages(user_id);
    CREATE INDEX agent_messages_conversation_id_idx ON agent_messages(conversation_id);
    CREATE INDEX agent_messages_created_at_idx ON agent_messages(created_at);
    
    CREATE TABLE agent_feedback (
      id TEXT PRIMARY KEY DEFAULT cuid(),
      message_id TEXT NOT NULL REFERENCES agent_messages(id) ON DELETE CASCADE ON UPDATE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
    
    CREATE INDEX agent_feedback_message_id_idx ON agent_feedback(message_id);
    CREATE INDEX agent_feedback_user_id_idx ON agent_feedback(user_id);
  `);
  
  // Create row-level security policies
  await db.execute(sql`
    -- Enable RLS on all tables
    ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE api_connections ENABLE ROW LEVEL SECURITY;
    ALTER TABLE agent_api_connections ENABLE ROW LEVEL SECURITY;
    ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE agent_feedback ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY agents_isolation_policy ON agents
      USING (user_id = current_setting('app.current_user_id')::TEXT);
      
    CREATE POLICY api_connections_isolation_policy ON api_connections
      USING (user_id = current_setting('app.current_user_id')::TEXT);
      
    CREATE POLICY agent_api_connections_isolation_policy ON agent_api_connections
      USING (agent_id IN (SELECT id FROM agents WHERE user_id = current_setting('app.current_user_id')::TEXT));
      
    CREATE POLICY agent_messages_isolation_policy ON agent_messages
      USING (user_id = current_setting('app.current_user_id')::TEXT OR 
             agent_id IN (SELECT id FROM agents WHERE user_id = current_setting('app.current_user_id')::TEXT));
             
    CREATE POLICY agent_feedback_isolation_policy ON agent_feedback
      USING (user_id = current_setting('app.current_user_id')::TEXT OR 
             message_id IN (SELECT id FROM agent_messages WHERE agent_id IN 
                           (SELECT id FROM agents WHERE user_id = current_setting('app.current_user_id')::TEXT)));
  `);
}

export async function down(db) {
  await db.execute(sql`
    DROP TABLE IF EXISTS agent_feedback;
    DROP TABLE IF EXISTS agent_messages;
    DROP TABLE IF EXISTS agent_api_connections;
    DROP TABLE IF EXISTS api_connections;
    DROP TABLE IF EXISTS agents;
  `);
}
```

## Performance Considerations

1. **Indexing**: Appropriate indexes have been created for frequently queried columns.
2. **Denormalization**: Some redundant data (like user_id in agent_messages) is included to optimize common queries.
3. **Pagination**: For tables that may grow large (like agent_messages), implement pagination in queries.
4. **Partitioning**: Consider partitioning the agent_messages table by conversation_id if it grows very large.

## Security Considerations

1. **API Key Protection**: API keys are encrypted at rest and only decrypted when needed.
2. **Row-Level Security**: Ensures users can only access their own data.
3. **Input Validation**: All user inputs should be validated before insertion.
4. **Parameterized Queries**: Use parameterized queries to prevent SQL injection.
5. **Audit Logging**: Consider adding audit logging for sensitive operations.

## Next Steps

1. Implement the schema in Drizzle ORM
2. Create migration scripts
3. Set up row-level security policies
4. Implement API key encryption/decryption utilities
5. Create database access functions for common operations 