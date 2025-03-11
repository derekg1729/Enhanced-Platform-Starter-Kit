import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const apiConnections = pgTable('api_connections', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  userId: text('user_id').notNull(),
  agentId: text('agent_id'),
  apiKey: text('api_key').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
}); 