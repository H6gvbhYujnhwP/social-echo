-- Migration: Add usage tracking
-- Date: 2025-10-15
-- Purpose: Add UsageCounter table and usage tracking fields to PostHistory

-- Add usage tracking fields to PostHistory (idempotent)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'PostHistory' AND column_name = 'firstGeneratedAt'
  ) THEN
    ALTER TABLE "PostHistory" ADD COLUMN "firstGeneratedAt" TIMESTAMP(3);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'PostHistory' AND column_name = 'customisationsUsed'
  ) THEN
    ALTER TABLE "PostHistory" ADD COLUMN "customisationsUsed" INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Create UsageCounter table (idempotent)
CREATE TABLE IF NOT EXISTS "UsageCounter" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "cycleStartUtc" TIMESTAMP(3) NOT NULL,
  "cycleEndUtc" TIMESTAMP(3) NOT NULL,
  "postsUsed" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UsageCounter_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'UsageCounter_userId_cycleStartUtc_cycleEndUtc_key'
  ) THEN
    ALTER TABLE "UsageCounter" ADD CONSTRAINT "UsageCounter_userId_cycleStartUtc_cycleEndUtc_key" 
    UNIQUE ("userId", "cycleStartUtc", "cycleEndUtc");
  END IF;
END $$;

-- Add indexes (idempotent)
CREATE INDEX IF NOT EXISTS "UsageCounter_userId_idx" ON "UsageCounter"("userId");
CREATE INDEX IF NOT EXISTS "UsageCounter_cycleStartUtc_idx" ON "UsageCounter"("cycleStartUtc");

-- Add foreign key constraint (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'UsageCounter_userId_fkey'
  ) THEN
    ALTER TABLE "UsageCounter" ADD CONSTRAINT "UsageCounter_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Backfill existing posts with firstGeneratedAt = createdAt where null
UPDATE "PostHistory" 
SET "firstGeneratedAt" = "createdAt" 
WHERE "firstGeneratedAt" IS NULL 
  AND "isRegeneration" = false;

-- Create usage counters for active users in current cycle
-- This will be handled by the application code to avoid complex SQL logic
-- Admin can run: POST /api/admin/usage/backfill to reconcile if needed

