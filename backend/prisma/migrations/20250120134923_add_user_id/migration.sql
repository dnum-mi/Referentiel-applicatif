/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[keycloakId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "actors" DROP CONSTRAINT "actors_userId_fkey";

-- DropForeignKey
ALTER TABLE "anomalyNotification" DROP CONSTRAINT "anomalyNotification_notifierId_fkey";

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "metadata" DROP CONSTRAINT "metadata_createdById_fkey";

-- DropForeignKey
ALTER TABLE "metadata" DROP CONSTRAINT "metadata_dataOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "metadata" DROP CONSTRAINT "metadata_updatedById_fkey";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_keycloakId_key" ON "users"("keycloakId");

-- AddForeignKey
ALTER TABLE "anomalyNotification" ADD CONSTRAINT "anomalyNotification_notifierId_fkey" FOREIGN KEY ("notifierId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metadata" ADD CONSTRAINT "metadata_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metadata" ADD CONSTRAINT "metadata_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metadata" ADD CONSTRAINT "metadata_dataOwnerId_fkey" FOREIGN KEY ("dataOwnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actors" ADD CONSTRAINT "actors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
