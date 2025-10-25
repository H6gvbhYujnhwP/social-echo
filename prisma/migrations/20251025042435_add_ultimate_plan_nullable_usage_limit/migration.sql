-- AlterTable: Make usageLimit nullable for Ultimate plan support
-- This allows null to represent unlimited usage for ultimate and agency plans

-- Step 1: Alter the column to be nullable (keeping default for new records)
ALTER TABLE "Subscription" ALTER COLUMN "usageLimit" DROP NOT NULL;

-- Step 2: Backfill existing records based on their plan
-- Starter plans: keep 8
-- Pro plans: set to 30
-- Agency plans: set to null (unlimited)
-- Any other plans: keep current value

UPDATE "Subscription" 
SET "usageLimit" = 30 
WHERE "plan" = 'pro' AND "usageLimit" != 30;

UPDATE "Subscription" 
SET "usageLimit" = NULL 
WHERE "plan" = 'agency';

-- Note: Ultimate plan subscriptions don't exist yet, but when created
-- they will have usageLimit = NULL to represent unlimited usage

