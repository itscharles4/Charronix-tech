/*
  Warnings:

  - Added the required column `updated_at` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('ACADEMIC', 'EVENT', 'ANNOUNCEMENT', 'ATTENDANCE', 'EXAM', 'FEE', 'COMPLAINT', 'GENERAL');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'SYSTEM';

-- DropIndex
DROP INDEX "notifications_created_at_idx";

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "category" "NotificationCategory" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "icon_emoji" TEXT,
ADD COLUMN     "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "read_at" TIMESTAMP(3),
ADD COLUMN     "sender_name" TEXT,
ADD COLUMN     "sender_role" TEXT,
ADD COLUMN     "sender_user_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'INFO';

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_category_idx" ON "notifications"("category");
