-- CreateEnum
CREATE TYPE "AnomalyNotificationStatus" AS ENUM ('in_pending', 'in_progress', 'done');

-- CreateTable
CREATE TABLE "anomalyNotification" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "notifierId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "AnomalyNotificationStatus" NOT NULL DEFAULT 'in_pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anomalyNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anomalyNotificationHystory" (
    "id" TEXT NOT NULL,
    "issueNotificationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" "AnomalyNotificationStatus" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anomalyNotificationHystory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "anomalyNotification" ADD CONSTRAINT "anomalyNotification_notifierId_fkey" FOREIGN KEY ("notifierId") REFERENCES "users"("keycloakId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anomalyNotification" ADD CONSTRAINT "anomalyNotification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anomalyNotificationHystory" ADD CONSTRAINT "anomalyNotificationHystory_issueNotificationId_fkey" FOREIGN KEY ("issueNotificationId") REFERENCES "anomalyNotification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
