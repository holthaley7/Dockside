/*
  Warnings:

  - You are about to drop the column `gearUsed` on the `catch_reports` table. All the data in the column will be lost.
  - You are about to drop the column `locationDescription` on the `catch_reports` table. All the data in the column will be lost.
  - You are about to drop the column `locationLat` on the `catch_reports` table. All the data in the column will be lost.
  - You are about to drop the column `locationLng` on the `catch_reports` table. All the data in the column will be lost.
  - You are about to drop the column `sizeCaught` on the `catch_reports` table. All the data in the column will be lost.
  - You are about to drop the column `timeOfDay` on the `catch_reports` table. All the data in the column will be lost.
  - You are about to drop the column `waterTempObserved` on the `catch_reports` table. All the data in the column will be lost.
  - Added the required column `username` to the `catch_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weightLbs` to the `catch_reports` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "catch_reports" DROP CONSTRAINT "catch_reports_userId_fkey";

-- AlterTable
ALTER TABLE "catch_reports" DROP COLUMN "gearUsed",
DROP COLUMN "locationDescription",
DROP COLUMN "locationLat",
DROP COLUMN "locationLng",
DROP COLUMN "sizeCaught",
DROP COLUMN "timeOfDay",
DROP COLUMN "waterTempObserved",
ADD COLUMN     "catchAndRelease" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "flagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lengthIn" DOUBLE PRECISION,
ADD COLUMN     "locationName" TEXT,
ADD COLUMN     "locationOther" TEXT,
ADD COLUMN     "timeCaught" TEXT,
ADD COLUMN     "username" TEXT NOT NULL,
ADD COLUMN     "waterTempF" DOUBLE PRECISION,
ADD COLUMN     "weightLbs" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "species" ADD COLUMN     "maxWeightLbs" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "catch_reports" ADD CONSTRAINT "catch_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
