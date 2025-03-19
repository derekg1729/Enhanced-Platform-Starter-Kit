-- DEPLOYMENT FIX: Ensure agents table has the required schema
-- This migration is specifically for fixing deployment issues
-- It will run during the build process on Vercel

-- First, create the agents table if it doesn't exist
CREATE TABLE IF NOT EXISTS "agents" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "model" TEXT NOT NULL DEFAULT 'gpt-4',
  "temperature" REAL NOT NULL DEFAULT 0.7,
  "instructions" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL,
  "userId" TEXT
);

-- Add index on userId if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'agents' AND indexname = 'agents_userId_idx'
  ) THEN
    CREATE INDEX "agents_userId_idx" ON "agents" ("userId");
  END IF;
END
$$;

-- Also ensure the apiConnections table exists
CREATE TABLE IF NOT EXISTS "apiConnections" (
  "id" TEXT PRIMARY KEY,
  "service" TEXT NOT NULL,
  "encryptedApiKey" TEXT NOT NULL,
  "name" TEXT DEFAULT 'Default',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL,
  "userId" TEXT
);

-- Add index on userId if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'apiConnections' AND indexname = 'apiConnections_userId_idx'
  ) THEN
    CREATE INDEX "apiConnections_userId_idx" ON "apiConnections" ("userId");
  END IF;
END
$$;

-- Add unique index on service+userId if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'apiConnections' AND indexname = 'apiConnections_service_userId_key'
  ) THEN
    CREATE UNIQUE INDEX "apiConnections_service_userId_key" ON "apiConnections" ("service", "userId");
  END IF;
END
$$; 