-- Drop extra columns from agents table to match the current schema
ALTER TABLE "agents" DROP COLUMN IF EXISTS "instructions";
ALTER TABLE "agents" DROP COLUMN IF EXISTS "temperature"; 