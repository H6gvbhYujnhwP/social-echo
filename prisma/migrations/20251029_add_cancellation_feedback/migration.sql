-- CreateTable
CREATE TABLE "CancellationFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CancellationFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CancellationFeedback_userId_idx" ON "CancellationFeedback"("userId");

-- CreateIndex
CREATE INDEX "CancellationFeedback_reason_idx" ON "CancellationFeedback"("reason");

-- AddForeignKey
ALTER TABLE "CancellationFeedback" ADD CONSTRAINT "CancellationFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
