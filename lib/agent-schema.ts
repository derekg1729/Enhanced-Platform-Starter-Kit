import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./schema";

/**
 * Agent Platform Database Schema
 * 
 * This file defines the database schema for the Agent Platform, including:
 * - agents: Main table for storing agent metadata
 * - apiConnections: Table for storing API connection details
 * - agentApiConnections: Junction table for agent-API connections
 * - agentMessages: Table for storing conversation history
 * - agentFeedback: Table for storing user feedback on agent responses
 */

// Main table for storing agent metadata
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

// Table for storing API connection details
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

// Junction table for agent-API connections
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

// Table for storing conversation history
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

// Table for storing user feedback on agent responses
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

// Define relationships between tables
export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, { references: [users.id], fields: [agents.userId] }),
  apiConnections: many(agentApiConnections),
  messages: many(agentMessages),
}));

export const apiConnectionsRelations = relations(apiConnections, ({ one, many }) => ({
  user: one(users, { references: [users.id], fields: [apiConnections.userId] }),
  agents: many(agentApiConnections),
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

// Export types for use in the application
export type Agent = typeof agents.$inferSelect;
export type ApiConnection = typeof apiConnections.$inferSelect;
export type AgentApiConnection = typeof agentApiConnections.$inferSelect;
export type AgentMessage = typeof agentMessages.$inferSelect;
export type AgentFeedback = typeof agentFeedback.$inferSelect; 