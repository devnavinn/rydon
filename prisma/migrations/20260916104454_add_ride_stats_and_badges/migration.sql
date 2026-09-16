-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'BADGE_EARNED';

-- AlterTable
ALTER TABLE "RideMember" ADD COLUMN     "avgSpeedKph" DECIMAL(5,2),
ADD COLUMN     "distanceKm" INTEGER,
ADD COLUMN     "durationMin" INTEGER,
ADD COLUMN     "statsComputedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "RiderProfile" DROP COLUMN "badges";

-- CreateTable
CREATE TABLE "RiderBadge" (
    "id" TEXT NOT NULL,
    "riderProfileId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rideId" TEXT,

    CONSTRAINT "RiderBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RiderBadge_riderProfileId_idx" ON "RiderBadge"("riderProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "RiderBadge_riderProfileId_code_key" ON "RiderBadge"("riderProfileId", "code");

-- AddForeignKey
ALTER TABLE "RiderBadge" ADD CONSTRAINT "RiderBadge_riderProfileId_fkey" FOREIGN KEY ("riderProfileId") REFERENCES "RiderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

