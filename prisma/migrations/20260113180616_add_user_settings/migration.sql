-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "name" TEXT,
    "image" TEXT,
    "password" TEXT,
    "planType" TEXT NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "subscriptionEndsAt" DATETIME,
    "documentsCount" INTEGER NOT NULL DEFAULT 0,
    "storageUsedBytes" BIGINT NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL DEFAULT 'en',
    "folderPin" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "notifications" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "documentsCount", "email", "emailVerified", "id", "image", "name", "password", "planType", "storageUsedBytes", "stripeCustomerId", "stripeSubscriptionId", "subscriptionEndsAt", "subscriptionStatus", "updatedAt") SELECT "createdAt", "documentsCount", "email", "emailVerified", "id", "image", "name", "password", "planType", "storageUsedBytes", "stripeCustomerId", "stripeSubscriptionId", "subscriptionEndsAt", "subscriptionStatus", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
