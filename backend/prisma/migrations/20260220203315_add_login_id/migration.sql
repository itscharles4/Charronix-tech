/*
  Warnings:

  - A unique constraint covering the columns `[login_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "login_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_login_id_key" ON "users"("login_id");
