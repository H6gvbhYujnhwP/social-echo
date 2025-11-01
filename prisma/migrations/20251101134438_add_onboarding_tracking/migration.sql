-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "onboardingSkipped" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingStartedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3);
