import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from "./schema";

// Create a database connection
export const db = drizzle(sql, { schema, logger: true });

export default db;

export type DrizzleClient = typeof db;
