-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "pendingPlan" TEXT,
ADD COLUMN     "pendingAt" TIMESTAMP(3),
ADD COLUMN     "scheduleId" TEXT;

