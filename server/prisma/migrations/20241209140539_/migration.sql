/*
  Warnings:

  - You are about to drop the column `uri` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "applications" DROP COLUMN "uri",
DROP COLUMN "url";
