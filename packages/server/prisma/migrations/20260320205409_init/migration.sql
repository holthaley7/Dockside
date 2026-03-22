-- CreateEnum
CREATE TYPE "Zone" AS ENUM ('NEARSHORE', 'OFFSHORE');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('REGULATION', 'RESEARCH', 'COMMUNITY', 'MANUAL');

-- CreateEnum
CREATE TYPE "TipCategory" AS ENUM ('BAIT', 'GEAR', 'LOCATION', 'TECHNIQUE', 'REGULATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ScanFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ScanSourceType" AS ENUM ('REGULATION', 'WEATHER', 'RESEARCH', 'NEWS');

-- CreateTable
CREATE TABLE "species" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '🐟',
    "color" TEXT NOT NULL DEFAULT '#C8A55A',
    "zone" "Zone" NOT NULL,
    "season" TEXT NOT NULL,
    "peakSeason" TEXT NOT NULL,
    "primeHour" TEXT NOT NULL,
    "avgSize" TEXT NOT NULL,
    "bagLimit" TEXT NOT NULL,
    "sizeLimit" TEXT NOT NULL,
    "migrationPatterns" TEXT NOT NULL,
    "idealTides" TEXT NOT NULL,
    "idealDepths" TEXT NOT NULL,
    "waterTemp" TEXT NOT NULL,
    "bait" TEXT NOT NULL,
    "gear" TEXT NOT NULL,
    "visionAndColor" TEXT NOT NULL,
    "filletRules" TEXT NOT NULL,
    "mustKnow" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "species_updates" (
    "id" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "fieldChanged" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sourceType" "SourceType" NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "species_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "passwordHash" TEXT,
    "authProvider" TEXT NOT NULL DEFAULT 'email',
    "reputationScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catch_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "dateCaught" TIMESTAMP(3) NOT NULL,
    "locationLat" DOUBLE PRECISION,
    "locationLng" DOUBLE PRECISION,
    "locationDescription" TEXT,
    "sizeCaught" TEXT,
    "baitUsed" TEXT,
    "gearUsed" TEXT,
    "tideConditions" TEXT,
    "waterTempObserved" TEXT,
    "timeOfDay" TEXT,
    "weatherConditions" TEXT,
    "notes" TEXT,
    "photoUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catch_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tips" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "tipText" TEXT NOT NULL,
    "category" "TipCategory" NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_tips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "speciesId" TEXT,
    "catchReportId" TEXT,
    "parentCommentId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "scanFrequency" "ScanFrequency" NOT NULL,
    "sourceType" "ScanSourceType" NOT NULL,
    "lastScannedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scan_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan_results" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "rawContent" TEXT,
    "summary" TEXT,
    "speciesIdsAffected" TEXT[],
    "actionRequired" BOOLEAN NOT NULL DEFAULT false,
    "actionTaken" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scan_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general_info" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "general_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "species_name_key" ON "species"("name");

-- CreateIndex
CREATE UNIQUE INDEX "species_slug_key" ON "species"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "general_info_category_key_key" ON "general_info"("category", "key");

-- AddForeignKey
ALTER TABLE "species_updates" ADD CONSTRAINT "species_updates_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catch_reports" ADD CONSTRAINT "catch_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catch_reports" ADD CONSTRAINT "catch_reports_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tips" ADD CONSTRAINT "user_tips_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tips" ADD CONSTRAINT "user_tips_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "species"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_catchReportId_fkey" FOREIGN KEY ("catchReportId") REFERENCES "catch_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_results" ADD CONSTRAINT "scan_results_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "scan_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
