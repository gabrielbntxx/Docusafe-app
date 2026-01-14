-- AlterTable
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT,
ADD COLUMN "stripeSubscriptionId" TEXT,
ADD COLUMN "subscriptionStatus" TEXT,
ADD COLUMN "subscriptionEndsAt" TIMESTAMP(3),
ADD COLUMN "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN "folderPin" TEXT,
ADD COLUMN "theme" TEXT NOT NULL DEFAULT 'light',
ADD COLUMN "notificationsEnabled" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
