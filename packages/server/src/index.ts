// Dockside API — San Diego sport fishing intelligence
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { getConditions } from "./conditions";
import { scoreSpecies } from "./scoring";
import { refreshFishWatchData, getLatestFishWatchResult } from "./fishWatch";

dotenv.config({ path: "../../.env" });

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// List all species
app.get("/api/species", async (_req, res) => {
  try {
    const { zone, search } = _req.query;

    const where: Record<string, unknown> = {};

    if (zone && typeof zone === "string") {
      where.zone = zone.toUpperCase();
    }

    if (search && typeof search === "string") {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { bait: { contains: search, mode: "insensitive" } },
        { gear: { contains: search, mode: "insensitive" } },
      ];
    }

    const species = await prisma.species.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        imageUrl: true,
        color: true,
        zone: true,
        season: true,
        peakSeason: true,
        avgSize: true,
        bagLimit: true,
        sizeLimit: true,
        waterTemp: true,
      },
    });

    res.json(species);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch species" });
  }
});

// Get single species by slug (includes latest FishWatch stock status)
app.get("/api/species/:slug", async (req, res) => {
  try {
    const species = await prisma.species.findUnique({
      where: { slug: req.params.slug },
    });

    if (!species) {
      res.status(404).json({ error: "Species not found" });
      return;
    }

    const stockStatus = await getLatestFishWatchResult(prisma, species.id);
    res.json({ ...species, stockStatus: stockStatus ?? null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch species" });
  }
});

// Get general info by category
app.get("/api/general-info", async (_req, res) => {
  try {
    const { category } = _req.query;

    const where: Record<string, unknown> = {};
    if (category && typeof category === "string") {
      where.category = category;
    }

    const info = await prisma.generalInfo.findMany({
      where,
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });

    // Group by category
    const grouped: Record<string, Array<{ key: string; value: string }>> = {};
    for (const item of info) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push({ key: item.key, value: item.value });
    }

    res.json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch general info" });
  }
});

// Get current conditions (tides, water temp, weather)
app.get("/api/conditions", async (_req, res) => {
  try {
    const conditions = await getConditions();
    res.json(conditions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch conditions" });
  }
});

// Get species scored against current conditions
app.get("/api/recommendations", async (_req, res) => {
  try {
    const [conditions, species] = await Promise.all([
      getConditions(),
      prisma.species.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          imageUrl: true,
          color: true,
          zone: true,
          season: true,
          peakSeason: true,
          primeHour: true,
          avgSize: true,
          bagLimit: true,
          sizeLimit: true,
          waterTemp: true,
          idealTides: true,
          bait: true,
        },
      }),
    ]);

    const scored = scoreSpecies(species, conditions);
    res.json({ conditions, recommendations: scored });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

// Manual refresh trigger (admin use)
app.post("/api/admin/refresh-fishwatch", async (_req, res) => {
  try {
    await refreshFishWatchData(prisma);
    res.json({ ok: true, message: "FishWatch refresh complete" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Refresh failed" });
  }
});

const MS_PER_HOUR = 60 * 60 * 1000;
const FISHWATCH_REFRESH_INTERVAL = 24 * MS_PER_HOUR;

app.listen(PORT, () => {
  console.log(`Dockside API running on http://localhost:${PORT}`);

  // Run FishWatch refresh on startup, then every 24 hours
  refreshFishWatchData(prisma).catch(console.error);
  setInterval(() => {
    refreshFishWatchData(prisma).catch(console.error);
  }, FISHWATCH_REFRESH_INTERVAL);
});
