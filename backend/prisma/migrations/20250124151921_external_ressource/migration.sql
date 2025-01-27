-- CreateEnum
CREATE TYPE "ExternalRessourceType" AS ENUM ('documentation', 'supervision', 'service');

-- CreateTable
CREATE TABLE "ExternalRessource" (
    "id" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "description" TEXT,
    "type" "ExternalRessourceType" NOT NULL,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "ExternalRessource_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExternalRessource" ADD CONSTRAINT "ExternalRessource_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
