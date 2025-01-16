-- CreateEnum
CREATE TYPE "ComplianceType" AS ENUM ('regulation', 'standard', 'policy', 'contractual', 'security', 'privacy');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('compliant', 'non_compliant', 'partially_compliant', 'not_concerned');

-- CreateEnum
CREATE TYPE "ExternalSourceType" AS ENUM ('organization', 'application', 'regulation', 'financial', 'population');

-- CreateEnum
CREATE TYPE "ExternalSourceValueType" AS ENUM ('url', 'uri', 'identifier', 'name');

-- CreateEnum
CREATE TYPE "LifecycleStatus" AS ENUM ('under_construction', 'in_production', 'decommissioned', 'retired_from_service');

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "shortName" TEXT,
    "logo" TEXT,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "purposes" TEXT[],
    "tags" TEXT[],
    "lifecycleId" TEXT NOT NULL,
    "metadataId" TEXT NOT NULL,
    "parentId" TEXT,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliances" (
    "id" TEXT NOT NULL,
    "type" "ComplianceType" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ComplianceStatus" NOT NULL,
    "validityStart" TIMESTAMP(3),
    "validityEnd" TIMESTAMP(3),
    "scoreValue" TEXT,
    "scoreUnit" TEXT,
    "notes" TEXT,
    "metadataId" TEXT,
    "applicationId" TEXT,

    CONSTRAINT "compliances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "externals" (
    "id" TEXT NOT NULL,
    "externalSourceId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "shortName" TEXT,
    "lastSourceUpdate" TIMESTAMP(3) NOT NULL,
    "metadataId" TEXT NOT NULL,
    "applicationId" TEXT,

    CONSTRAINT "externals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "externalSources" (
    "id" TEXT NOT NULL,
    "type" "ExternalSourceType" NOT NULL,
    "uri" TEXT NOT NULL,
    "valueType" "ExternalSourceValueType" NOT NULL,
    "metadataId" TEXT NOT NULL,

    CONSTRAINT "externalSources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lifecycles" (
    "id" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL,
    "firstProductionDate" TIMESTAMP(3),
    "plannedDecommissioningDate" TIMESTAMP(3),
    "metadataId" TEXT NOT NULL,

    CONSTRAINT "lifecycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metadata" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "dataOwnerId" TEXT,

    CONSTRAINT "metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "keycloakId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("keycloakId")
);

-- CreateTable
CREATE TABLE "actors" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "applicationId" TEXT,

    CONSTRAINT "actors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "applications_label_idx" ON "applications"("label");

-- CreateIndex
CREATE INDEX "applications_shortName_idx" ON "applications"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "externalSources_uri_key" ON "externalSources"("uri");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "actors_userId_idx" ON "actors"("userId");

-- CreateIndex
CREATE INDEX "actors_applicationId_idx" ON "actors"("applicationId");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_lifecycleId_fkey" FOREIGN KEY ("lifecycleId") REFERENCES "lifecycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "metadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("keycloakId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliances" ADD CONSTRAINT "compliances_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "metadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliances" ADD CONSTRAINT "compliances_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "externals" ADD CONSTRAINT "externals_externalSourceId_fkey" FOREIGN KEY ("externalSourceId") REFERENCES "externalSources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "externals" ADD CONSTRAINT "externals_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "metadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "externals" ADD CONSTRAINT "externals_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "externalSources" ADD CONSTRAINT "externalSources_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "metadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lifecycles" ADD CONSTRAINT "lifecycles_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "metadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metadata" ADD CONSTRAINT "metadata_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("keycloakId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metadata" ADD CONSTRAINT "metadata_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("keycloakId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metadata" ADD CONSTRAINT "metadata_dataOwnerId_fkey" FOREIGN KEY ("dataOwnerId") REFERENCES "users"("keycloakId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "externals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actors" ADD CONSTRAINT "actors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("keycloakId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actors" ADD CONSTRAINT "actors_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "externals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actors" ADD CONSTRAINT "actors_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
