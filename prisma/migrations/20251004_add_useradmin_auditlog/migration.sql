-- Add new columns to "User" for admin management
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "isSuspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Create "AuditLog" table for tracking admin actions
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "targetId" TEXT,
  "meta" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for AuditLog
CREATE INDEX IF NOT EXISTS "AuditLog_actorId_idx" ON "AuditLog" ("actorId");
CREATE INDEX IF NOT EXISTS "AuditLog_targetId_idx" ON "AuditLog" ("targetId");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog" ("createdAt");
