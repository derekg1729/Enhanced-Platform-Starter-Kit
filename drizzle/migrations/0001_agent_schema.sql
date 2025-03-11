-- Migration for Agent Platform Schema
-- Creates tables for agents, API connections, messages, and feedback
-- Also sets up row-level security policies for multi-tenant isolation

-- Create agents table
CREATE TABLE IF NOT EXISTS "agents" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "system_prompt" TEXT NOT NULL,
  "model" TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
  "temperature" NUMERIC NOT NULL DEFAULT 0.7,
  "max_tokens" INTEGER,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "agents_user_id_idx" ON "agents"("user_id");
CREATE INDEX IF NOT EXISTS "agents_name_idx" ON "agents"("name");

-- Create api_connections table
CREATE TABLE IF NOT EXISTS "api_connections" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "service" TEXT NOT NULL,
  "api_key" TEXT NOT NULL,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "metadata" JSONB
);

CREATE INDEX IF NOT EXISTS "api_connections_user_id_idx" ON "api_connections"("user_id");
CREATE INDEX IF NOT EXISTS "api_connections_service_idx" ON "api_connections"("service");

-- Create agent_api_connections junction table
CREATE TABLE IF NOT EXISTS "agent_api_connections" (
  "id" TEXT PRIMARY KEY,
  "agent_id" TEXT NOT NULL REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "api_connection_id" TEXT NOT NULL REFERENCES "api_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "agent_api_connections_agent_id_idx" ON "agent_api_connections"("agent_id");
CREATE INDEX IF NOT EXISTS "agent_api_connections_api_connection_id_idx" ON "agent_api_connections"("api_connection_id");
CREATE UNIQUE INDEX IF NOT EXISTS "agent_api_connections_unique_connection_idx" ON "agent_api_connections"("agent_id", "api_connection_id");

-- Create agent_messages table
CREATE TABLE IF NOT EXISTS "agent_messages" (
  "id" TEXT PRIMARY KEY,
  "agent_id" TEXT NOT NULL REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "conversation_id" TEXT NOT NULL,
  "metadata" JSONB
);

CREATE INDEX IF NOT EXISTS "agent_messages_agent_id_idx" ON "agent_messages"("agent_id");
CREATE INDEX IF NOT EXISTS "agent_messages_user_id_idx" ON "agent_messages"("user_id");
CREATE INDEX IF NOT EXISTS "agent_messages_conversation_id_idx" ON "agent_messages"("conversation_id");
CREATE INDEX IF NOT EXISTS "agent_messages_created_at_idx" ON "agent_messages"("created_at");

-- Create agent_feedback table
CREATE TABLE IF NOT EXISTS "agent_feedback" (
  "id" TEXT PRIMARY KEY,
  "message_id" TEXT NOT NULL REFERENCES "agent_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "agent_feedback_message_id_idx" ON "agent_feedback"("message_id");
CREATE INDEX IF NOT EXISTS "agent_feedback_user_id_idx" ON "agent_feedback"("user_id");

-- Enable row-level security on all tables
ALTER TABLE "agents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "api_connections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agent_api_connections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agent_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agent_feedback" ENABLE ROW LEVEL SECURITY;

-- Create row-level security policies
-- Agents: Users can only see their own agents
CREATE POLICY "agents_isolation_policy" ON "agents"
  USING ("user_id" = current_setting('app.current_user_id', TRUE)::TEXT);

-- API Connections: Users can only see their own API connections
CREATE POLICY "api_connections_isolation_policy" ON "api_connections"
  USING ("user_id" = current_setting('app.current_user_id', TRUE)::TEXT);

-- Agent API Connections: Users can only see connections for their agents
CREATE POLICY "agent_api_connections_isolation_policy" ON "agent_api_connections"
  USING ("agent_id" IN (
    SELECT "id" FROM "agents" 
    WHERE "user_id" = current_setting('app.current_user_id', TRUE)::TEXT
  ));

-- Agent Messages: Users can only see messages for their agents or messages they sent
CREATE POLICY "agent_messages_isolation_policy" ON "agent_messages"
  USING ("user_id" = current_setting('app.current_user_id', TRUE)::TEXT OR 
         "agent_id" IN (
           SELECT "id" FROM "agents" 
           WHERE "user_id" = current_setting('app.current_user_id', TRUE)::TEXT
         ));

-- Agent Feedback: Users can only see feedback for their agents or feedback they gave
CREATE POLICY "agent_feedback_isolation_policy" ON "agent_feedback"
  USING ("user_id" = current_setting('app.current_user_id', TRUE)::TEXT OR 
         "message_id" IN (
           SELECT "id" FROM "agent_messages" 
           WHERE "agent_id" IN (
             SELECT "id" FROM "agents" 
             WHERE "user_id" = current_setting('app.current_user_id', TRUE)::TEXT
           )
         )); 