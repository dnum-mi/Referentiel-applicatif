-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('Responsable', 'Exploitation', 'ResponsableAutre', 'Hebergement', 'ArchitecteApplicatif', 'ArchitecteInfra', 'RepresentantSSI', 'Autre');

-- DropForeignKey
ALTER TABLE "actors" DROP CONSTRAINT "actors_userId_fkey";

-- AlterTable
ALTER TABLE "actors" ADD COLUMN     "actorType" "ActorType",
ADD COLUMN     "email" TEXT,
ALTER COLUMN "role" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "actors" ADD CONSTRAINT "actors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("keycloakId") ON DELETE SET NULL ON UPDATE CASCADE;
