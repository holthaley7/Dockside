// Species scoring engine — scores each species against current conditions

import type { CurrentConditions } from "./conditions";

interface SpeciesData {
  id: string;
  name: string;
  slug: string;
  icon: string;
  imageUrl: string | null;
  color: string;
  zone: string;
  season: string;
  peakSeason: string;
  primeHour: string;
  avgSize: string;
  bagLimit: string;
  sizeLimit: string;
  waterTemp: string;
  idealTides: string;
  bait: string;
}

export interface ScoredSpecies {
  id: string;
  name: string;
  slug: string;
  icon: string;
  imageUrl: string | null;
  color: string;
  zone: string;
  avgSize: string;
  bagLimit: string;
  score: number;
  rating: "great" | "good" | "fair" | "poor";
  reason: string;
  factors: {
    season: { score: number; detail: string };
    waterTemp: { score: number; detail: string };
    tide: { score: number; detail: string };
    timeOfDay: { score: number; detail: string };
  };
}

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

function parseMonthRange(text: string): { start: number; end: number } | null {
  const match = text.toLowerCase().match(/(\w+)\s*[-–]\s*(\w+)/);
  if (!match) return null;
  const start = MONTH_NAMES.indexOf(match[1]);
  const end = MONTH_NAMES.indexOf(match[2]);
  if (start === -1 || end === -1) return null;
  return { start, end };
}

function isMonthInRange(month: number, start: number, end: number): boolean {
  if (start <= end) return month >= start && month <= end;
  return month >= start || month <= end; // wraps around year
}

function scoreSeason(peakSeason: string, season: string): { score: number; detail: string } {
  const month = new Date().getMonth();
  const peak = parseMonthRange(peakSeason);

  if (peak && isMonthInRange(month, peak.start, peak.end)) {
    return { score: 25, detail: `Peak season (${peakSeason})` };
  }

  // Check if in general season
  if (season.toLowerCase().includes("year-round")) {
    if (peak) {
      return { score: 12, detail: `Year-round, but peak is ${peakSeason}` };
    }
    return { score: 18, detail: "Year-round species" };
  }

  const gen = parseMonthRange(season);
  if (gen && isMonthInRange(month, gen.start, gen.end)) {
    return { score: 15, detail: `In season (${season})` };
  }

  return { score: 0, detail: "Out of season" };
}

function parseTempRange(text: string): { min: number; max: number } | null {
  // Parse "60-70 degrees F" or "60-70°F"
  const match = text.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (!match) return null;
  return { min: parseInt(match[1]), max: parseInt(match[2]) };
}

function scoreWaterTemp(
  idealTemp: string,
  currentTempF: number | null
): { score: number; detail: string } {
  if (currentTempF === null) {
    return { score: 12, detail: "Water temp unavailable" };
  }

  const range = parseTempRange(idealTemp);
  if (!range) {
    return { score: 12, detail: "Could not parse ideal temp range" };
  }

  const { min, max } = range;
  const mid = (min + max) / 2;

  if (currentTempF >= min && currentTempF <= max) {
    // In ideal range — score based on how centered
    const distFromMid = Math.abs(currentTempF - mid);
    const halfRange = (max - min) / 2;
    const proximity = 1 - distFromMid / halfRange;
    const score = Math.round(18 + 7 * proximity); // 18-25
    return {
      score,
      detail: `${currentTempF.toFixed(0)}°F is in ideal range (${min}-${max}°F)`,
    };
  }

  // Outside range — how far off?
  const distance = currentTempF < min ? min - currentTempF : currentTempF - max;
  if (distance <= 3) {
    return {
      score: 12,
      detail: `${currentTempF.toFixed(0)}°F is close to ideal (${min}-${max}°F)`,
    };
  }
  if (distance <= 8) {
    return {
      score: 5,
      detail: `${currentTempF.toFixed(0)}°F is outside ideal range (${min}-${max}°F)`,
    };
  }
  return {
    score: 0,
    detail: `${currentTempF.toFixed(0)}°F is far from ideal (${min}-${max}°F)`,
  };
}

function scoreTide(
  idealTides: string,
  currentState: string
): { score: number; detail: string } {
  if (currentState === "unknown") {
    return { score: 12, detail: "Tide data unavailable" };
  }

  const ideal = idealTides.toLowerCase();
  const state = currentState.toLowerCase();

  // Direct match checks
  if (ideal.includes("incoming") && state.includes("incoming")) {
    return { score: 25, detail: `Incoming tide matches ideal (${idealTides})` };
  }
  if (ideal.includes("outgoing") && state.includes("outgoing")) {
    return { score: 25, detail: `Outgoing tide matches ideal (${idealTides})` };
  }
  if (ideal.includes("slack") && state.includes("slack")) {
    return { score: 25, detail: `Slack tide matches ideal (${idealTides})` };
  }
  if (ideal.includes("high") && state.includes("incoming")) {
    return { score: 18, detail: `Incoming toward high — good for species wanting high tides` };
  }
  if (ideal.includes("not as particular")) {
    return { score: 18, detail: "Not tide-sensitive — any tide works" };
  }
  if (ideal.includes("low") && state.includes("outgoing")) {
    return { score: 18, detail: "Outgoing toward low — good for lure fishing" };
  }

  // Partial matches
  if (
    (ideal.includes("outgoing") || ideal.includes("slack")) &&
    (state.includes("outgoing") || state.includes("slack"))
  ) {
    return { score: 20, detail: `${currentState} tide partially matches (${idealTides})` };
  }

  return { score: 8, detail: `Current: ${currentState}. Ideal: ${idealTides}` };
}

function scoreTimeOfDay(primeHour: string): { score: number; detail: string } {
  const hour = new Date().getHours();
  const text = primeHour.toLowerCase();

  // Dawn/dusk species (most common)
  const isDawnDusk =
    text.includes("dawn") || text.includes("dusk") || text.includes("early morning");
  const isDawn = hour >= 4 && hour <= 8;
  const isDusk = hour >= 16 && hour <= 20;

  if (isDawnDusk && (isDawn || isDusk)) {
    return { score: 25, detail: "Prime time — dawn/dusk feeding window" };
  }
  if (isDawnDusk && (hour >= 8 && hour <= 10 || hour >= 14 && hour <= 16)) {
    return { score: 15, detail: "Near prime time — close to dawn/dusk window" };
  }

  // Night species
  if (text.includes("night") && (hour >= 20 || hour <= 5)) {
    return { score: 25, detail: "Prime time — nighttime species" };
  }

  // Daytime/all-day species
  if (text.includes("throughout the day") || text.includes("standard")) {
    if (hour >= 6 && hour <= 18) {
      return { score: 20, detail: "Daytime species — good anytime during daylight" };
    }
    return { score: 8, detail: "Daytime species — better during daylight hours" };
  }

  // Midday
  if (text.includes("mid-morning") || text.includes("afternoon")) {
    if (hour >= 9 && hour <= 15) {
      return { score: 22, detail: "In the midday fishing window" };
    }
  }

  // Default based on general fishing hours
  if (hour >= 5 && hour <= 19) {
    return { score: 12, detail: "Daylight hours — reasonable fishing time" };
  }
  return { score: 5, detail: "Outside typical fishing hours" };
}

export function scoreSpecies(
  species: SpeciesData[],
  conditions: CurrentConditions
): ScoredSpecies[] {
  const currentTempF = conditions.waterTemp?.fahrenheit ?? null;

  return species
    .map((s) => {
      const season = scoreSeason(s.peakSeason, s.season);
      const waterTemp = scoreWaterTemp(s.waterTemp, currentTempF);
      const tide = scoreTide(s.idealTides, conditions.currentTideState);
      const timeOfDay = scoreTimeOfDay(s.primeHour);

      const score = season.score + waterTemp.score + tide.score + timeOfDay.score;

      let rating: "great" | "good" | "fair" | "poor";
      if (score >= 75) rating = "great";
      else if (score >= 50) rating = "good";
      else if (score >= 25) rating = "fair";
      else rating = "poor";

      // Generate a concise reason
      const topFactor = [season, waterTemp, tide, timeOfDay].sort(
        (a, b) => b.score - a.score
      )[0];

      return {
        id: s.id,
        name: s.name,
        slug: s.slug,
        icon: s.icon,
        imageUrl: s.imageUrl,
        color: s.color,
        zone: s.zone,
        avgSize: s.avgSize,
        bagLimit: s.bagLimit,
        score,
        rating,
        reason: topFactor.detail,
        factors: { season, waterTemp, tide, timeOfDay },
      };
    })
    .sort((a, b) => b.score - a.score);
}
