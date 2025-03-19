-- Fix agents schema by ensuring the temperature and instructions columns exist
-- Instead of dropping columns, we'll make sure they exist
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "temperature" REAL NOT NULL DEFAULT 0.7;
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "instructions" TEXT; 