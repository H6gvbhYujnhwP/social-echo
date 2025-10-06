-- EMERGENCY DATABASE FIX
-- Issue: Missing agencyId column on User table causing admin panel to fail
-- Date: October 6, 2025
-- 
-- This script adds the missing agency relationship fields to the database
-- Run this on your production database to fix the admin user management page

-- Step 1: Add agencyId column to User table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'agencyId'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "agencyId" TEXT;
        RAISE NOTICE 'Added agencyId column to User table';
    ELSE
        RAISE NOTICE 'agencyId column already exists';
    END IF;
END $$;

-- Step 2: Create index on agencyId for performance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'User' AND indexname = 'User_agencyId_idx'
    ) THEN
        CREATE INDEX "User_agencyId_idx" ON "User"("agencyId");
        RAISE NOTICE 'Created index on User.agencyId';
    ELSE
        RAISE NOTICE 'Index on agencyId already exists';
    END IF;
END $$;

-- Step 3: Add foreign key constraint (if Agency table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Agency') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'User_agencyId_fkey'
        ) THEN
            ALTER TABLE "User" 
            ADD CONSTRAINT "User_agencyId_fkey" 
            FOREIGN KEY ("agencyId") 
            REFERENCES "Agency"("id") 
            ON DELETE SET NULL 
            ON UPDATE CASCADE;
            RAISE NOTICE 'Added foreign key constraint for agencyId';
        ELSE
            RAISE NOTICE 'Foreign key constraint already exists';
        END IF;
    ELSE
        RAISE NOTICE 'Agency table does not exist yet - skipping foreign key';
    END IF;
END $$;

-- Step 4: Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'User' 
AND column_name = 'agencyId';

-- Expected output:
-- column_name | data_type | is_nullable
-- agencyId    | text      | YES
