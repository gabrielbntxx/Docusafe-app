-- Add title and message columns to Notification table
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "message" TEXT;
