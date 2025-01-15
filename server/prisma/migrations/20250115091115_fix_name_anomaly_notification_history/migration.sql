/*
  Warnings:

  - You are about to drop the `anomalyNotificationHystory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "anomalyNotificationHystory" DROP CONSTRAINT "anomalyNotificationHystory_issueNotificationId_fkey";

-- DropTable
DROP TABLE "anomalyNotificationHystory";

-- CreateTable
CREATE TABLE "anomalyNotificationHistory" (
    "id" TEXT NOT NULL,
    "issueNotificationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" "AnomalyNotificationStatus" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anomalyNotificationHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "anomalyNotificationHistory" ADD CONSTRAINT "anomalyNotificationHistory_issueNotificationId_fkey" FOREIGN KEY ("issueNotificationId") REFERENCES "anomalyNotification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
