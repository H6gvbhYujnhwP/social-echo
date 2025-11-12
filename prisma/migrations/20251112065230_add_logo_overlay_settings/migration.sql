-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "logoPosition" TEXT DEFAULT 'bottom-right',
ADD COLUMN     "logoSize" TEXT DEFAULT 'medium',
ADD COLUMN     "logoEnabled" BOOLEAN NOT NULL DEFAULT true;
