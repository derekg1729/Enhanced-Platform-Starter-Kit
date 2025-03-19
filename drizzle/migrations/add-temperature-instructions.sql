-- Add temperature and instructions fields to the agents table
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "temperature" REAL NOT NULL DEFAULT 0.7;
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "instructions" TEXT; 