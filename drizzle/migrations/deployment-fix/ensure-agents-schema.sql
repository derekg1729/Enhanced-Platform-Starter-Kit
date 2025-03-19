-- DEPLOYMENT FIX: Ensure agents table has the required temperature and instructions columns
-- This migration is specifically for fixing deployment issues
-- It will run during the build process on Vercel

-- Add temperature column if it doesn't exist
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "temperature" REAL NOT NULL DEFAULT 0.7;

-- Add instructions column if it doesn't exist
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "instructions" TEXT; 