-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MASTER_ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "AdminConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "json" JSONB NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminConfigHistory" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "json" JSONB NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminConfigHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminConfig_key_key" ON "AdminConfig"("key");

-- CreateIndex
CREATE INDEX "AdminConfig_key_idx" ON "AdminConfig"("key");

-- CreateIndex
CREATE INDEX "AdminConfigHistory_key_idx" ON "AdminConfigHistory"("key");

-- CreateIndex
CREATE INDEX "AdminConfigHistory_createdAt_idx" ON "AdminConfigHistory"("createdAt");
