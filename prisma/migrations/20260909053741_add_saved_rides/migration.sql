-- CreateTable
CREATE TABLE "SavedRide" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedRide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedRide_rideId_idx" ON "SavedRide"("rideId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedRide_userId_rideId_key" ON "SavedRide"("userId", "rideId");

-- AddForeignKey
ALTER TABLE "SavedRide" ADD CONSTRAINT "SavedRide_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedRide" ADD CONSTRAINT "SavedRide_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;
