-- Add imageUrl and imageStyle columns to PostHistory table
ALTER TABLE "PostHistory"
ADD COLUMN IF NOT EXISTS "imageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "imageStyle" TEXT;

