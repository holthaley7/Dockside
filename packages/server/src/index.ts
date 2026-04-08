// Dockside API — San Diego sport fishing intelligence
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { getConditions } from "./conditions";
import { scoreSpecies } from "./scoring";
import { rankHotspots } from "./hotspots";
import { refreshFishWatchData, getLatestFishWatchResult } from "./fishWatch";

dotenv.config({ path: "../../.env" });

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Multer for catch photo uploads (max 5 MB, images only)
const UPLOADS_DIR = path.join(__dirname, "..", "uploads", "catches");
const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

app.use(cors());
app.use(express.json());
// Serve uploaded catch photos as static files
app.use("/uploads/catches", express.static(UPLOADS_DIR));
// Serve self-hosted species images (legally licensed, avoids hotlink blocks)
app.use("/uploads/species", express.static(path.join(__dirname, "..", "uploads", "species")));

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

// GET /api/species/:slug/hotspots — live-ranked fishing locations for this species
app.get("/api/species/:slug/hotspots", async (req, res) => {
  try {
    const species = await prisma.species.findUnique({
      where: { slug: req.params.slug },
      select: { id: true, idealTides: true, waterTemp: true, primeHour: true, zone: true, locations: true, bait: true, gear: true },
    });
    if (!species) { res.status(404).json({ error: "Species not found" }); return; }

    const locations: { name: string; note: string }[] = species.locations
      ? JSON.parse(species.locations)
      : [];

    if (locations.length === 0) {
      res.json({ conditions: null, hotspots: [] });
      return;
    }

    const conditions = await getConditions();
    const hotspots = rankHotspots(locations, {
      idealTides: species.idealTides,
      waterTemp: species.waterTemp,
      primeHour: species.primeHour,
      zone: species.zone,
      bait: species.bait,
      gear: species.gear,
    }, conditions);
    res.json({ conditions, hotspots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to rank hotspots" });
  }
});

// ── Community catch endpoints ──────────────────────────────────────────────

// GET /api/species/:slug/catches — catches list + aggregated stats
app.get("/api/species/:slug/catches", async (req, res) => {
  try {
    const species = await prisma.species.findUnique({
      where: { slug: req.params.slug },
      select: { id: true },
    });
    if (!species) { res.status(404).json({ error: "Species not found" }); return; }

    const catches = await prisma.catchReport.findMany({
      where: { speciesId: species.id },
      orderBy: { createdAt: "desc" },
    });

    // Aggregate stats
    const total = catches.length;
    const avgWeight =
      total > 0
        ? Math.round((catches.reduce((sum, c) => sum + c.weightLbs, 0) / total) * 10) / 10
        : null;

    const locationCounts: Record<string, number> = {};
    const baitCounts: Record<string, number> = {};
    const tideCounts: Record<string, number> = {};

    for (const c of catches) {
      const loc = c.locationName ?? c.locationOther ?? "Unknown";
      locationCounts[loc] = (locationCounts[loc] ?? 0) + 1;
      if (c.baitUsed) baitCounts[c.baitUsed] = (baitCounts[c.baitUsed] ?? 0) + 1;
      if (c.tideConditions) tideCounts[c.tideConditions] = (tideCounts[c.tideConditions] ?? 0) + 1;
    }

    const topN = (counts: Record<string, number>, n = 3) =>
      Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, n)
        .map(([name, count]) => ({ name, count }));

    res.json({
      total,
      avgWeight,
      topLocations: topN(locationCounts),
      topBaits: topN(baitCounts),
      topTides: topN(tideCounts),
      catches,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch catches" });
  }
});

// POST /api/species/:slug/catches — submit a catch report
app.post("/api/species/:slug/catches", upload.single("photo"), async (req, res) => {
  try {
    const species = await prisma.species.findUnique({
      where: { slug: req.params.slug },
      select: { id: true, maxWeightLbs: true },
    });
    if (!species) { res.status(404).json({ error: "Species not found" }); return; }

    const body = req.body as Record<string, string>;

    // ── Validation ──────────────────────────────────────────────────────────
    const errors: Record<string, string> = {};

    const username = (body.username ?? "").trim();
    if (!username) errors.username = "Username is required";
    else if (username.length < 3 || username.length > 20)
      errors.username = "Username must be 3–20 characters";

    if (!body.dateCaught) errors.dateCaught = "Date caught is required";
    else if (new Date(body.dateCaught) > new Date())
      errors.dateCaught = "Date cannot be in the future";

    if (!body.timeCaught) errors.timeCaught = "Time caught is required";

    if (!body.locationName) errors.locationName = "Location is required";
    if (body.locationName === "Other" && !body.locationOther?.trim())
      errors.locationOther = "Please describe the location";

    const weightLbs = parseFloat(body.weightLbs);
    if (!body.weightLbs || isNaN(weightLbs) || weightLbs <= 0)
      errors.weightLbs = "Weight is required and must be greater than 0";
    else if (species.maxWeightLbs && weightLbs > species.maxWeightLbs)
      errors.weightLbs = `That seems too heavy for this species (max ~${species.maxWeightLbs} lbs)`;

    if (body.lengthIn !== undefined && body.lengthIn !== "") {
      const len = parseFloat(body.lengthIn);
      if (isNaN(len) || len <= 0) errors.lengthIn = "Length must be greater than 0";
    }

    if (body.notes && body.notes.length > 500)
      errors.notes = "Notes must be 500 characters or fewer";

    if (Object.keys(errors).length > 0) {
      res.status(422).json({ errors });
      return;
    }

    // ── Persist ─────────────────────────────────────────────────────────────
    const photoUrl = req.file ? `/uploads/catches/${req.file.filename}` : undefined;

    const report = await prisma.catchReport.create({
      data: {
        username,
        speciesId: species.id,
        dateCaught: new Date(body.dateCaught),
        timeCaught: body.timeCaught,
        locationName: body.locationName !== "Other" ? body.locationName : null,
        locationOther: body.locationName === "Other" ? body.locationOther?.trim() : null,
        weightLbs,
        lengthIn: body.lengthIn ? parseFloat(body.lengthIn) : null,
        baitUsed: body.baitUsed?.trim() || null,
        tideConditions: body.tideConditions || null,
        waterTempF: body.waterTempF ? parseFloat(body.waterTempF) : null,
        weatherConditions: body.weatherConditions || null,
        notes: body.notes?.trim() || null,
        photoUrl: photoUrl ?? null,
        catchAndRelease: body.catchAndRelease === "true",
      },
    });

    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit catch" });
  }
});

// POST /api/catches/:id/flag — flag a catch for review
app.post("/api/catches/:id/flag", async (req, res) => {
  try {
    const report = await prisma.catchReport.update({
      where: { id: req.params.id },
      data: { flagged: true },
    });
    res.json({ ok: true, id: report.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to flag catch" });
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

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Dockside API running on http://localhost:${PORT}`);
    refreshFishWatchData(prisma).catch(console.error);
    setInterval(() => {
      refreshFishWatchData(prisma).catch(console.error);
    }, FISHWATCH_REFRESH_INTERVAL);
  });
}

export default app;