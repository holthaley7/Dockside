// Live conditions service — fetches from NOAA Tides, NOAA Buoy, and NWS Weather APIs

interface TidePrediction {
  time: string; // "HH:MM"
  height: number; // feet
  type: "H" | "L"; // High or Low
}

interface BuoyData {
  waterTempC: number;
  waterTempF: number;
  waveHeight: number | null; // meters
  timestamp: string;
}

interface WeatherData {
  temperature: number; // F
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  isDaytime: boolean;
}

export interface CurrentConditions {
  tides: TidePrediction[];
  currentTideState: string; // "incoming", "outgoing", "slack high", "slack low"
  nextTide: TidePrediction | null;
  waterTemp: { celsius: number; fahrenheit: number } | null;
  weather: WeatherData | null;
  fetchedAt: string;
}

// Simple in-memory cache (2 minutes)
let cachedConditions: CurrentConditions | null = null;
let cacheTime = 0;
const CACHE_TTL = 2 * 60 * 1000;

async function fetchTides(): Promise<TidePrediction[]> {
  const url =
    "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?" +
    "date=today&station=9410170&product=predictions&datum=MLLW" +
    "&time_zone=lst_ldt&interval=hilo&units=english&application=dockside&format=json";

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Tides API error: ${res.status}`);

  const data = await res.json();
  if (!data.predictions) return [];

  return data.predictions.map(
    (p: { t: string; v: string; type: string }) => ({
      time: p.t.split(" ")[1], // "HH:MM"
      height: parseFloat(p.v),
      type: p.type as "H" | "L",
    })
  );
}

async function fetchBuoyData(): Promise<BuoyData | null> {
  // 46047 Tanner Banks (offshore San Diego) — fallback to Scripps Pier (46254), then La Jolla (46232)
  for (const station of ["46047", "46254", "46232"]) {
    try {
      const url = `https://www.ndbc.noaa.gov/data/realtime2/${station}.txt`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) continue;

      const text = await res.text();
      const lines = text.split("\n").filter((l) => !l.startsWith("#") && l.trim());
      if (lines.length === 0) continue;

      // Parse first data line (most recent reading)
      const parts = lines[0].trim().split(/\s+/);
      // Columns: YY MM DD hh mm WDIR WSPD GST WVHT DPD APD MWD PRES ATMP WTMP DEWP VIS PTDY TIDE
      const wtmpIdx = 14; // WTMP column (0-indexed)
      const wvhtIdx = 8;

      if (parts.length <= wtmpIdx) continue; // Not enough columns

      const wtmpStr = parts[wtmpIdx];
      const wvhtStr = parts.length > wvhtIdx ? parts[wvhtIdx] : "MM";

      if (!wtmpStr || wtmpStr === "MM") continue; // Missing data

      const tempC = parseFloat(wtmpStr);
      const tempF = tempC * 9 / 5 + 32;

      return {
        waterTempC: Math.round(tempC * 10) / 10,
        waterTempF: Math.round(tempF * 10) / 10,
        waveHeight: wvhtStr !== "MM" ? parseFloat(wvhtStr) : null,
        timestamp: `${parts[0]}-${parts[1]}-${parts[2]} ${parts[3]}:${parts[4]} UTC`,
      };
    } catch {
      continue;
    }
  }
  return null;
}

async function fetchWeather(): Promise<WeatherData | null> {
  try {
    // NWS requires a User-Agent header
    const headers = { "User-Agent": "(Dockside, dockside-fishing@example.com)" };

    const forecastUrl = "https://api.weather.gov/gridpoints/SGX/57,14/forecast";
    const res = await fetch(forecastUrl, { headers, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;

    const data = await res.json();
    const period = data.properties?.periods?.[0];
    if (!period) return null;

    return {
      temperature: period.temperature,
      windSpeed: period.windSpeed,
      windDirection: period.windDirection,
      shortForecast: period.shortForecast,
      isDaytime: period.isDaytime,
    };
  } catch {
    return null;
  }
}

function determineTideState(
  tides: TidePrediction[]
): { state: string; next: TidePrediction | null } {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Find the next tide event
  let nextTide: TidePrediction | null = null;
  let prevTide: TidePrediction | null = null;

  for (const tide of tides) {
    const [h, m] = tide.time.split(":").map(Number);
    const tideMinutes = h * 60 + m;

    if (tideMinutes > nowMinutes) {
      nextTide = tide;
      break;
    }
    prevTide = tide;
  }

  // If all tides are past (late evening), infer state from last tide
  if (!nextTide) {
    if (prevTide) {
      const s = prevTide.type === "H" ? "outgoing" : "incoming";
      return { state: s, next: null };
    }
    return { state: "unknown", next: null };
  }

  // Determine state based on what's coming
  let state = "unknown";
  const [h, m] = nextTide.time.split(":").map(Number);
  const minutesUntil = h * 60 + m - nowMinutes;

  if (Math.abs(minutesUntil) < 30) {
    state = nextTide.type === "H" ? "slack high" : "slack low";
  } else if (nextTide.type === "H") {
    state = "incoming";
  } else {
    state = "outgoing";
  }

  return { state, next: nextTide };
}

export async function getConditions(): Promise<CurrentConditions> {
  // Return cache if fresh
  if (cachedConditions && Date.now() - cacheTime < CACHE_TTL) {
    return cachedConditions;
  }

  // Fetch all 3 sources in parallel
  const [tides, buoy, weather] = await Promise.all([
    fetchTides().catch(() => [] as TidePrediction[]),
    fetchBuoyData().catch(() => null),
    fetchWeather().catch(() => null),
  ]);

  const { state, next } = determineTideState(tides);

  const conditions: CurrentConditions = {
    tides,
    currentTideState: state,
    nextTide: next,
    waterTemp: buoy
      ? { celsius: buoy.waterTempC, fahrenheit: buoy.waterTempF }
      : null,
    weather,
    fetchedAt: new Date().toISOString(),
  };

  cachedConditions = conditions;
  cacheTime = Date.now();

  return conditions;
}
