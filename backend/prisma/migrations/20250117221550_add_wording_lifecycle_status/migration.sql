/*
  Warnings:

  - The values [retired_from_service] on the enum `LifecycleStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LifecycleStatus_new" AS ENUM ('under_construction', 'in_production', 'decommissioned', 'decommissioning');
ALTER TABLE "lifecycles" ALTER COLUMN "status" TYPE "LifecycleStatus_new" USING ("status"::text::"LifecycleStatus_new");
ALTER TYPE "LifecycleStatus" RENAME TO "LifecycleStatus_old";
ALTER TYPE "LifecycleStatus_new" RENAME TO "LifecycleStatus";
DROP TYPE "LifecycleStatus_old";
COMMIT;
