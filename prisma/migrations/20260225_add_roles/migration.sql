-- AlterTable: add role to TeamInvitation
ALTER TABLE "TeamInvitation" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'editeur';

-- Migrate existing members: "member" → "editeur"
UPDATE "User" SET "teamRole" = 'editeur' WHERE "teamRole" = 'member';
