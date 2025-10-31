-- AlterTable
ALTER TABLE "User" ADD COLUMN "hasUsedFreeTrial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "freeTrialUsedAt" TIMESTAMP(3),
ADD COLUMN "feedbackEmailSentAt" TIMESTAMP(3);
