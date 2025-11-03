-- CreateTable
CREATE TABLE "CustomRssFeed" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomRssFeed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomRssFeed_userId_idx" ON "CustomRssFeed"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomRssFeed_userId_url_key" ON "CustomRssFeed"("userId", "url");

-- AddForeignKey
ALTER TABLE "CustomRssFeed" ADD CONSTRAINT "CustomRssFeed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
