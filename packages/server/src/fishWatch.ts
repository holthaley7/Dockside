// NOAA FishWatch API integration
// Public API: https://www.fishwatch.gov/api/species
// Provides stock status, fishing rate, and sustainability data for federally managed species.
// State-managed species (calico bass, sand bass, corbina, croaker) are not in FishWatch — those
// are managed by CA DFW and have no public API; regulations must be monitored manually.

import { PrismaClient } from "@prisma/client";

const FISHWATCH_BASE = "https://www.fishwatch.gov/api/species";
const FISHWATCH_SOURCE_URL = "https://www.fishwatch.gov/api/species";

// Maps our species slugs to NOAA FishWatch species API names
const FISHWATCH_MAP: Record<string, string> = {
  "bluefin-tuna": "pacific-bluefin-tuna",
  "mahi-mahi-dorado": "mahi-mahi",
  "vermilion-sunset-rockfish": "vermilion-rockfish",
  "california-halibut": "california-halibut",
  "white-seabass": "white-seabass",
  "yellowtail-amberjack": "california-yellowtail",
};

// Species not in FishWatch (state-managed by CA DFW, no public API):
// calico-bass-kelp-bass, spotted-sand-bass, california-corbina, yellowfin-croaker

export interface FishWatchData {
  speciesName: string;
  populationStatus: string;
  fishingRate: string;
  habitat: string;
  biology: string;
  lastUpdated: string;
}

async function fetchSpeciesFromFishWatch(fishwatchSlug: string): Promise<FishWatchData | null> {
  try {
    const res = await fetch(`${FISHWATCH_BASE}/${fishwatchSlug}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const entry = Array.isArray(data) ? data[0] : data;
    if (!entry) return null;

    return {
      speciesName: entry["Species Name"] ?? fishwatchSlug,
      populationStatus: entry["Population Status"] ?? "Unknown",
      fishingRate: entry["Fishing Rate"] ?? "Unknown",
      habitat: entry["Habitat"] ?? "",
      biology: entry["Biology"] ?? "",
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function refreshFishWatchData(prisma: PrismaClient): Promise<void> {
  console.log("[FishWatch] Starting daily refresh...");

  // Ensure the FishWatch scan source exists
  let source = await prisma.scanSource.findFirst({ where: { url: FISHWATCH_SOURCE_URL } });
  if (source) {
    source = await prisma.scanSource.update({
      where: { id: source.id },
      data: { lastScannedAt: new Date() },
    });
  } else {
    source = await prisma.scanSource.create({
      data: {
        name: "NOAA FishWatch — Species Stock Status",
        url: FISHWATCH_SOURCE_URL,
        scanFrequency: "DAILY",
        sourceType: "RESEARCH",
        isActive: true,
      },
    });
  }

  let updated = 0;

  for (const [slug, fishwatchSlug] of Object.entries(FISHWATCH_MAP)) {
    const speciesRecord = await prisma.species.findUnique({ where: { slug } });
    if (!speciesRecord) continue;

    const data = await fetchSpeciesFromFishWatch(fishwatchSlug);
    if (!data) {
      console.log(`[FishWatch] No data for ${slug} (${fishwatchSlug})`);
      continue;
    }

    const summary = `Population: ${data.populationStatus} | Fishing Rate: ${data.fishingRate}`;

    await prisma.scanResult.create({
      data: {
        sourceId: source.id,
        summary,
        rawContent: JSON.stringify(data),
        speciesIdsAffected: [speciesRecord.id],
        actionRequired: false,
        scannedAt: new Date(),
      },
    });

    console.log(`[FishWatch] ${slug}: ${summary}`);
    updated++;
  }

  console.log(`[FishWatch] Refresh complete — updated ${updated}/${Object.keys(FISHWATCH_MAP).length} species`);
}

// Returns the most recent FishWatch scan result for a species
export async function getLatestFishWatchResult(
  prisma: PrismaClient,
  speciesId: string
): Promise<{ summary: string; scannedAt: Date } | null> {
  const source = await prisma.scanSource.findFirst({
    where: { url: FISHWATCH_SOURCE_URL },
  });
  if (!source) return null;

  const result = await prisma.scanResult.findFirst({
    where: {
      sourceId: source.id,
      speciesIdsAffected: { has: speciesId },
    },
    orderBy: { scannedAt: "desc" },
  });

  if (!result) return null;
  return { summary: result.summary ?? "", scannedAt: result.scannedAt };
}
