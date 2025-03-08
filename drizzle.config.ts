import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv';

// Load environment variables from .env.local if it exists
dotenv.config({ path: '.env.local' });

// Fallback to .env if .env.local doesn't exist
if (!process.env.POSTGRES_URL) {
  dotenv.config();
}

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('No database connection string found. Please set POSTGRES_URL or DATABASE_URL in your environment variables.');
}

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
