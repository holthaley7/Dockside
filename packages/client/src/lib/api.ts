const API_BASE = "/api";

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
  tides: TidePrediction[];
  currentTideState: string;
  nextTide: TidePrediction | null;
  waterTemp: { celsius: number; fahrenheit: number } | null;
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
