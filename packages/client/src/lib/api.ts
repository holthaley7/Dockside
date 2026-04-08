const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export interface SpeciesListItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  imageUrl: string | null;
  color: string;
  zone: "NEARSHORE" | "OFFSHORE";
  season: string;
  peakSeason: string;
  avgSize: string;
  bagLimit: string;
  sizeLimit: string;
  waterTemp: string;
}

export interface Species extends SpeciesListItem {
  primeHour: string;
  migrationPatterns: string;
  idealTides: string;
  idealDepths: string;
  bait: string;
  gear: string;
  visionAndColor: string;
  filletRules: string;
  mustKnow: string;
  locations: string | null;
  communityTips: string | null;
  communityPosts: string | null;
  stockStatus: { summary: string; scannedAt: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface GeneralInfo {
  [category: string]: Array<{ key: string; value: string }>;
}

export async function fetchSpecies(
  zone?: string,
  search?: string
): Promise<SpeciesListItem[]> {
  const params = new URLSearchParams();
  if (zone) params.set("zone", zone);
  if (search) params.set("search", search);
  const res = await fetch(`${API_BASE}/species?${params}`);
  if (!res.ok) throw new Error("Failed to fetch species");
  return res.json();
}

export async function fetchSpeciesBySlug(slug: string): Promise<Species> {
  const res = await fetch(`${API_BASE}/species/${slug}`);
  if (!res.ok) throw new Error("Species not found");
  return res.json();
}

export async function fetchGeneralInfo(): Promise<GeneralInfo> {
  const res = await fetch(`${API_BASE}/general-info`);
  if (!res.ok) throw new Error("Failed to fetch general info");
  return res.json();
}

// Live conditions & recommendations

export interface TidePrediction {
  time: string;
  height: number;
  type: "H" | "L";
}

export interface CurrentConditions {
  location: string;
  tides: TidePrediction[];
  currentTideState: string;
  nextTide: TidePrediction | null;
  waterTemp: { celsius: number; fahrenheit: number; stationId: string } | null;
  weather: {
    temperature: number;
    windSpeed: string;
    windDirection: string;
    shortForecast: string;
    isDaytime: boolean;
  } | null;
  fetchedAt: string;
}

export interface ScoreFactor {
  score: number;
  detail: string;
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
    season: ScoreFactor;
    waterTemp: ScoreFactor;
    tide: ScoreFactor;
    timeOfDay: ScoreFactor;
  };
}

export interface RecommendationsResponse {
  conditions: CurrentConditions;
  recommendations: ScoredSpecies[];
}

export async function fetchRecommendations(): Promise<RecommendationsResponse> {
  const res = await fetch(`${API_BASE}/recommendations`);
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
}

// ── Community catches ────────────────────────────────────────────────────────

export interface CatchReport {
  id: string;
  username: string;
  dateCaught: string;
  timeCaught: string | null;
  locationName: string | null;
  locationOther: string | null;
  weightLbs: number;
  lengthIn: number | null;
  baitUsed: string | null;
  tideConditions: string | null;
  waterTempF: number | null;
  weatherConditions: string | null;
  notes: string | null;
  photoUrl: string | null;
  catchAndRelease: boolean;
  flagged: boolean;
  createdAt: string;
}

export interface CatchStats {
  total: number;
  avgWeight: number | null;
  topLocations: { name: string; count: number }[];
  topBaits: { name: string; count: number }[];
  topTides: { name: string; count: number }[];
  catches: CatchReport[];
}

export async function fetchCatches(slug: string): Promise<CatchStats> {
  const res = await fetch(`${API_BASE}/species/${slug}/catches`);
  if (!res.ok) throw new Error("Failed to fetch catches");
  return res.json();
}

export async function submitCatch(
  slug: string,
  formData: FormData
): Promise<CatchReport> {
  const res = await fetch(`${API_BASE}/species/${slug}/catches`, {
    method: "POST",
    body: formData, // multipart — no Content-Type header needed
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error("Validation failed") as Error & { errors?: Record<string, string> };
    err.errors = body.errors;
    throw err;
  }
  return res.json();
}

// ── Live hotspot rankings ────────────────────────────────────────────────────

export interface RankedHotspot {
  name: string;
  note: string;
  score: number;
  rating: "prime" | "good" | "fair" | "tough";
  nowBlurb: string;
  methodBlurb: string;
  accessNote: string | null;
}

export interface HotspotsResponse {
  conditions: CurrentConditions | null;
  hotspots: RankedHotspot[];
}

export async function fetchHotspots(slug: string): Promise<HotspotsResponse> {
  const res = await fetch(`${API_BASE}/species/${slug}/hotspots`);
  if (!res.ok) throw new Error("Failed to fetch hotspots");
  return res.json();
}

export async function flagCatch(catchId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/catches/${catchId}/flag`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to flag catch");
}

// San Diego fishing locations used in the catch form
export const SD_LOCATIONS = [
  "Mission Beach",
  "La Jolla Kelp Beds",
  "Shelter Island",
  "Ocean Beach Pier",
  "Point Loma",
  "Mission Bay",
  "San Diego Bay",
  "Torrey Pines",
  "Coronado",
  "Del Mar",
  "Oceanside",
  "Coronado Islands",
  "9-Mile Bank",
  "Tanner/Cortez Banks",
  "La Jolla Shores",
  "Silver Strand Beach",
  "Other",
] as const;
