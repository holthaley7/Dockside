import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchRecommendations,
  type RecommendationsResponse,
  type ScoredSpecies,
} from "../lib/api";
import { useViewMode } from "../context/ViewModeContext";

const ratingConfig = {
  great: { label: "Great", bg: "bg-green-900/40", text: "text-green-400", border: "border-green-800/50" },
  good: { label: "Good", bg: "bg-blue-900/40", text: "text-blue-400", border: "border-blue-800/50" },
  fair: { label: "Fair", bg: "bg-yellow-900/40", text: "text-yellow-400", border: "border-yellow-800/50" },
  poor: { label: "Poor", bg: "bg-gray-800/40", text: "text-gray-500", border: "border-gray-700/50" },
};

function ConditionsBar({ data }: { data: RecommendationsResponse }) {
  const { conditions } = data;
  const w = conditions.weather;

  return (
    <div className="space-y-2 mb-6">
      {/* Location label */}
      <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
        📍 {conditions.location ?? "San Diego, CA"}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Water temp */}
        <div className="flex items-center gap-2 bg-navy-800/60 border border-navy-700/40 rounded-lg px-3 py-3">
          <span className="text-base flex-shrink-0">🌡️</span>
          <div className="min-w-0">
            <span className="text-xs font-mono text-gray-500 block">Water Temp</span>
            <span className="text-sm font-mono text-gray-200 block truncate">
              {conditions.waterTemp
                ? `${conditions.waterTemp.fahrenheit.toFixed(0)}°F`
                : "Unavailable"}
            </span>
          </div>
        </div>

        {/* Tide */}
        <div className="flex items-center gap-2 bg-navy-800/60 border border-navy-700/40 rounded-lg px-3 py-3">
          <span className="text-base flex-shrink-0">🌊</span>
          <div className="min-w-0">
            <span className="text-xs font-mono text-gray-500 block">Tide</span>
            <span className="text-sm font-mono text-gray-200 block truncate capitalize">
              {conditions.currentTideState !== "unknown"
                ? conditions.currentTideState
                : "Unavailable"}
            </span>
          </div>
        </div>

        {/* Air temp / weather */}
        <div className="flex items-center gap-2 bg-navy-800/60 border border-navy-700/40 rounded-lg px-3 py-3">
          <span className="text-base flex-shrink-0">☀️</span>
          <div className="min-w-0">
            <span className="text-xs font-mono text-gray-500 block">Weather</span>
            <span className="text-sm font-mono text-gray-200 block truncate">
              {w ? `${w.temperature}°F` : "Unavailable"}
            </span>
            <span className="text-[10px] font-mono text-gray-500 block truncate">
              {w ? w.shortForecast : ""}
            </span>
          </div>
        </div>

        {/* Wind */}
        <div className="flex items-center gap-2 bg-navy-800/60 border border-navy-700/40 rounded-lg px-3 py-3">
          <span className="text-base flex-shrink-0">💨</span>
          <div className="min-w-0">
            <span className="text-xs font-mono text-gray-500 block">Wind</span>
            <span className="text-sm font-mono text-gray-200 block truncate">
              {w ? `${w.windSpeed}` : "Unavailable"}
            </span>
            <span className="text-[10px] font-mono text-gray-500 block truncate">
              {w ? w.windDirection : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBreakdown({ factors }: { factors: ScoredSpecies["factors"] }) {
  const items = [
    { label: "Season", ...factors.season },
    { label: "Water Temp", ...factors.waterTemp },
    { label: "Tide", ...factors.tide },
    { label: "Time of Day", ...factors.timeOfDay },
  ];

  return (
    <div className="mt-3 pt-3 border-t border-navy-700/30 grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className="w-16 bg-navy-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-sand/60 rounded-full transition-all"
              style={{ width: `${(item.score / 25) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-gray-500">
            {item.label}: {item.score}/25
          </span>
        </div>
      ))}
    </div>
  );
}

function RecommendationCard({ species }: { species: ScoredSpecies }) {
  const [expanded, setExpanded] = useState(false);
  const { compact } = useViewMode();
  const config = ratingConfig[species.rating];

  return (
    <div className="bg-navy-800/50 border border-navy-700/50 rounded-xl hover:border-sand/20 transition-all">
      <div className={`flex ${compact ? "flex-col" : "flex-row"}`}>
        {/* Fish image */}
        <Link
          to={`/species/${species.slug}`}
          className={`bg-navy-950 flex items-center justify-center group ${
            compact ? "w-full h-36" : "flex-shrink-0 w-36"
          }`}
        >
          {species.imageUrl ? (
            <img
              src={species.imageUrl}
              alt={species.name}
              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span className="text-4xl">{species.icon}</span>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col gap-2">
          {/* Row 1: name + score side by side */}
          <div className="flex items-start justify-between gap-2">
            <Link to={`/species/${species.slug}`} className="group flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-gray-100 group-hover:text-sand transition-colors leading-tight">
                {species.name}
              </h4>
            </Link>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-mono text-gray-200 leading-none">
                  {species.score}
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
                  {config.label}
                </span>
              </div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs font-mono text-sand/60 hover:text-sand transition-colors"
              >
                {expanded ? "hide" : "Breakdown"}
              </button>
            </div>
          </div>

          {/* Row 2: reason */}
          <p className="text-sm font-mono text-gray-400">{species.reason}</p>

          {/* Row 3: stats — full width */}
          <div className="flex gap-2">
            <div className="flex-1 bg-navy-900/60 rounded px-2 py-1">
              <span className="text-[10px] font-mono text-gray-600 uppercase tracking-wide block">Zone</span>
              <span className="text-xs font-mono text-gray-300 capitalize">{species.zone.toLowerCase()}</span>
            </div>
            <div className="flex-1 bg-navy-900/60 rounded px-2 py-1">
              <span className="text-[10px] font-mono text-gray-600 uppercase tracking-wide block">Avg Size</span>
              <span className="text-xs font-mono text-gray-300">{species.avgSize}</span>
            </div>
            <div className="flex-1 bg-navy-900/60 rounded px-2 py-1">
              <span className="text-[10px] font-mono text-gray-600 uppercase tracking-wide block">Limit</span>
              <span className="text-xs font-mono text-gray-300">{species.bagLimit}</span>
            </div>
          </div>

          {expanded && <ScoreBreakdown factors={species.factors} />}
        </div>
      </div>
    </div>
  );
}

export default function WhatsBiting() {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function load() {
      fetchRecommendations()
        .then((d) => { if (!cancelled) { setData(d); setError(false); } })
        .catch(() => { if (!cancelled) setError(true); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }

    load();

    // Refresh every 5 minutes
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  if (loading) {
    return (
      <div className="bg-navy-800/30 border border-navy-700/30 rounded-2xl p-8 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 border-2 border-sand/30 border-t-sand rounded-full animate-spin" />
          <span className="text-sm font-mono text-gray-500">
            Fetching live conditions from NOAA & NWS...
          </span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-navy-800/30 border border-navy-700/30 rounded-2xl p-8 mb-10 text-center">
        <p className="text-gray-500 font-mono text-sm mb-3">
          Could not load live conditions — external APIs may be temporarily unavailable.
        </p>
        <button
          onClick={() => { setLoading(true); setError(false); fetchRecommendations().then(setData).catch(() => setError(true)).finally(() => setLoading(false)); }}
          className="text-sm font-mono text-sand/70 hover:text-sand transition-colors border border-sand/20 rounded-lg px-4 py-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-navy-800/30 border border-sand/10 rounded-2xl p-6 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-100">
            What's Biting Now
          </h2>
          <p className="text-sm font-mono text-gray-500 mt-1">
            Live conditions · Scored against each species' preferences · Updates every 5 min
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-[9px] font-mono text-gray-600">
            Data from NOAA Tides · NDBC Buoy · NWS Weather
          </p>
          <p className="text-[9px] font-mono text-gray-600">
            Last updated:{" "}
            {new Date(data.conditions.fetchedAt).toLocaleTimeString()}
          </p>
        </div>
      </div>

      <ConditionsBar data={data} />

      <div className="space-y-3">
        {data.recommendations.map((species) => (
          <RecommendationCard key={species.id} species={species} />
        ))}
      </div>
    </div>
  );
}
