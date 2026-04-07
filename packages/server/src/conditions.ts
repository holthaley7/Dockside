// Live conditions service for San Diego, CA
// Sources: NWS Weather (two-step points → hourly), NOAA Tides, NDBC Buoy

const SD_LAT = 32.7157;
const SD_LON = -117.1611;
const SD_TIDE_STATION = "9410170"; // San Diego

// ── Interfaces ────────────────────────────────────────────────────────────────

interface TidePrediction {
  time: string;  // "HH:MM" local
  height: number; // feet MLLW
  type: "H" | "L";
}

interface BuoyData {
  waterTempC: number;
  waterTempF: number;
  waveHeight: number | null; // meters
  stationId: string;
  timestamp: string;
}

interface WeatherData {
  temperature: number;    // °F, current hour
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  isDaytime: boolean;
}

export interface CurrentConditions {
  location: string;       // always "San Diego, CA"
  tides: TidePrediction[];
  currentTideState: string;
  nextTide: TidePrediction | null;
  waterTemp: { celsius: number; fahrenheit: number; stationId: string } | null;
  weather: WeatherData | null;
  fetchedAt: string;
}

// ── Separate per-source caches ────────────────────────────────────────────────

const WEATHER_TTL =  5 * 60 * 1000; //  5 minutes
const TIDES_TTL   = 30 * 60 * 1000; // 30 minutes
const BUOY_TTL    = 60 * 60 * 1000; //  1 hour

let cachedWeather: WeatherData | null = null;
let weatherAt = 0;

let cachedTides: TidePrediction[] = [];
let tidesAt = 0;

let cachedBuoy: BuoyData | null = null;
let buoyAt = 0;

// ── Helpers ───────────────────────────────────────────────────────────────────

function degreesToCardinal(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

function isDaytimeNow(): boolean {
  const h = new Date().getHours();
  return h >= 6 && h < 20;
}

// ── KSAN (primary) — NOAA ASOS, San Diego International Airport ───────────────
// Official NWS surface observation, right on the bay, updated every hour.

async function fetchWeatherKSAN(): Promise<WeatherData | null> {
  const headers = {
    "User-Agent": "Dockside fishing app (contact: dockside-fishing@example.com)",
    Accept: "application/geo+json",
  };

  const res = await fetch(
    "https://api.weather.gov/stations/KSAN/observations/latest",
    { headers, signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) throw new Error(`KSAN observations returned ${res.status}`);

  const data = await res.json() as {
    properties?: {
      temperature?: { value: number | null; unitCode: string };
      windSpeed?: { value: number | null };       // km/h
      windDirection?: { value: number | null };   // degrees
      textDescription?: string;
      timestamp?: string;
    };
  };

  const props = data.properties;
  if (!props) throw new Error("KSAN response missing properties");

  const tempC = props.temperature?.value;
  if (tempC == null) throw new Error("KSAN temperature is null");

  // Convert °C → °F
  const tempF = Math.round(tempC * 9 / 5 + 32);

  // Wind speed: km/h → mph
  const windKph = props.windSpeed?.value ?? 0;
  const windMph = Math.round(windKph / 1.60934);

  const windDeg = props.windDirection?.value ?? 0;
  const cardinal = degreesToCardinal(windDeg);

  const description = props.textDescription || "Clear";

  console.log(
    `[Weather] KSAN raw: ${tempC}°C → ${tempF}°F | ` +
    `wind ${windMph} mph ${cardinal} | ` +
    `"${description}" | obs ${props.timestamp ?? "unknown"}`
  );

  return {
    temperature: tempF,
    windSpeed: `${windMph} mph`,
    windDirection: cardinal,
    shortForecast: description,
    isDaytime: isDaytimeNow(),
  };
}

// ── Open-Meteo (fallback) ─────────────────────────────────────────────────────

async function fetchWeatherOpenMeteo(): Promise<WeatherData | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${SD_LAT}&longitude=${SD_LON}` +
    `&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph` +
    `&timezone=America%2FLos_Angeles`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`);

  const data = await res.json() as {
    current?: {
      temperature_2m: number;
      wind_speed_10m: number;
      wind_direction_10m: number;
      weather_code: number;
    };
  };

  const cur = data.current;
  if (!cur) throw new Error("Open-Meteo response missing current block");

  const wmoDesc = (code: number): string => {
    if (code === 0)                return "Sunny";
    if (code <= 3)                 return "Partly Cloudy";
    if (code === 45 || code === 48) return "Foggy";
    if (code >= 51 && code <= 55) return "Drizzle";
    if (code >= 61 && code <= 65) return "Rain";
    if (code >= 80 && code <= 82) return "Showers";
    if (code >= 95)               return "Thunderstorm";
    return "Cloudy";
  };

  console.log(
    `[Weather] Open-Meteo fallback: ${cur.temperature_2m}°F (rounds to ${Math.round(cur.temperature_2m)}°F)`
  );

  return {
    temperature: Math.round(cur.temperature_2m),
    windSpeed: `${Math.round(cur.wind_speed_10m)} mph`,
    windDirection: degreesToCardinal(cur.wind_direction_10m),
    shortForecast: wmoDesc(cur.weather_code),
    isDaytime: isDaytimeNow(),
  };
}

// ── fetchWeather: KSAN with Open-Meteo fallback ───────────────────────────────

async function fetchWeather(): Promise<WeatherData | null> {
  if (cachedWeather && Date.now() - weatherAt < WEATHER_TTL) {
    return cachedWeather;
  }

  let result: WeatherData | null = null;

  try {
    result = await fetchWeatherKSAN();
  } catch (err) {
    console.warn("[Weather] KSAN failed, trying Open-Meteo fallback:", err);
    try {
      result = await fetchWeatherOpenMeteo();
    } catch (fallbackErr) {
      console.warn("[Weather] Open-Meteo fallback also failed:", fallbackErr);
    }
  }

  if (result) {
    cachedWeather = result;
    weatherAt = Date.now();
  }
  return result;
}

// ── NDBC Buoy water temperature ───────────────────────────────────────────────
// Primary:  46086 — San Diego Offshore (closest dedicated SD station)
// Fallback: 46025 — Santa Monica Basin (reliable nearshore SoCal)
// Further:  46047, 46254, 46232

async function fetchBuoyData(): Promise<BuoyData | null> {
  if (cachedBuoy && Date.now() - buoyAt < BUOY_TTL) {
    return cachedBuoy;
  }

  const stations = ["46086", "46025", "46047", "46254", "46232"];

  for (const station of stations) {
    try {
      const url = `https://www.ndbc.noaa.gov/data/realtime2/${station}.txt`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) continue;

      const text = await res.text();
      // Skip header/comment lines
      const lines = text
        .split("\n")
        .filter((l) => !l.startsWith("#") && l.trim().length > 0);
      if (lines.length === 0) continue;

      // Most recent reading is the first non-header line
      const parts = lines[0].trim().split(/\s+/);
      // Column layout: YY MM DD hh mm WDIR WSPD GST WVHT DPD APD MWD PRES ATMP WTMP DEWP …
      //  index:         0  1  2  3  4   5    6    7    8    9  10  11   12   13   14   15
      const WTMP_IDX = 14;
      const WVHT_IDX = 8;

      if (parts.length <= WTMP_IDX) continue;

      const wtmpStr = parts[WTMP_IDX];
      if (!wtmpStr || wtmpStr === "MM") continue; // "MM" = missing

      const tempC = parseFloat(wtmpStr);
      if (isNaN(tempC)) continue;

      const tempF = Math.round((tempC * 9 / 5 + 32) * 10) / 10;
      const wvhtStr = parts.length > WVHT_IDX ? parts[WVHT_IDX] : "MM";

      cachedBuoy = {
        waterTempC: Math.round(tempC * 10) / 10,
        waterTempF: tempF,
        waveHeight: wvhtStr !== "MM" ? parseFloat(wvhtStr) : null,
        stationId: station,
        timestamp: `${parts[0]}-${parts[1]}-${parts[2]} ${parts[3]}:${parts[4]} UTC`,
      };
      buoyAt = Date.now();
      return cachedBuoy;
    } catch {
      continue;
    }
  }

  return null; // all stations failed — show "unavailable" rather than wrong data
}

// ── NOAA Tides ───────────────────────────────────────────────────────────────

async function fetchTides(): Promise<TidePrediction[]> {
  if (cachedTides.length > 0 && Date.now() - tidesAt < TIDES_TTL) {
    return cachedTides;
  }

  const url =
    `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
    `date=today&station=${SD_TIDE_STATION}&product=predictions&datum=MLLW` +
    `&time_zone=lst_ldt&interval=hilo&units=english&application=dockside&format=json`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Tides API returned ${res.status}`);

  const data = await res.json() as {
    predictions?: Array<{ t: string; v: string; type: string }>;
  };
  if (!data.predictions) return [];

  cachedTides = data.predictions.map((p) => ({
    time: p.t.split(" ")[1], // "YYYY-MM-DD HH:MM" → "HH:MM"
    height: parseFloat(p.v),
    type: p.type as "H" | "L",
  }));
  tidesAt = Date.now();
  return cachedTides;
}

// ── Tide state logic ──────────────────────────────────────────────────────────

function determineTideState(
  tides: TidePrediction[]
): { state: string; next: TidePrediction | null } {
  if (tides.length === 0) return { state: "unknown", next: null };

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  let prevTide: TidePrediction | null = null;
  let nextTide: TidePrediction | null = null;

  for (const tide of tides) {
    const [h, m] = tide.time.split(":").map(Number);
    const tideMin = h * 60 + m;
    if (tideMin > nowMinutes) {
      nextTide = tide;
      break;
    }
    prevTide = tide;
  }

  if (!nextTide) {
    // All tides are in the past — infer from the last one
    return {
      state: prevTide ? (prevTide.type === "H" ? "outgoing" : "incoming") : "unknown",
      next: null,
    };
  }

  const [nh, nm] = nextTide.time.split(":").map(Number);
  const minutesUntil = nh * 60 + nm - nowMinutes;
  let state: string;

  if (Math.abs(minutesUntil) < 30) {
    state = nextTide.type === "H" ? "slack high" : "slack low";
  } else if (nextTide.type === "H") {
    state = "incoming";
  } else {
    state = "outgoing";
  }

  return { state, next: nextTide };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getConditions(): Promise<CurrentConditions> {
  // Fetch all three sources in parallel — each has its own TTL-based cache
  const [tides, buoy, weather] = await Promise.all([
    fetchTides().catch((err) => {
      console.warn("Tides fetch failed:", err);
      return [] as TidePrediction[];
    }),
    fetchBuoyData().catch((err) => {
      console.warn("Buoy fetch failed:", err);
      return null;
    }),
    fetchWeather().catch((err) => {
      console.warn("Weather fetch failed:", err);
      return null;
    }),
  ]);

  const { state, next } = determineTideState(tides);

  return {
    location: "San Diego, CA",
    tides,
    currentTideState: state,
    nextTide: next,
    waterTemp: buoy
      ? { celsius: buoy.waterTempC, fahrenheit: buoy.waterTempF, stationId: buoy.stationId }
      : null,
    weather,
    fetchedAt: new Date().toISOString(),
  };
}
