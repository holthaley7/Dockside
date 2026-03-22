import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchRecommendations,
  type RecommendationsResponse,
  type ScoredSpecies,
} from "../lib/api";

const ratingConfig = {
  great: { label: "Great", bg: "bg-green-900/40", text: "text-green-400", border: "border-green-800/50" },
  good: { label: "Good", bg: "bg-blue-900/40", text: "text-blue-400", border: "border-blue-800/50" },
  fair: { label: "Fair", bg: "bg-yellow-900/40", text: "text-yellow-400", border: "border-yellow-800/50" },
  poor: { label: "Poor", bg: "bg-gray-800/40", text: "text-gray-500", border: "border-gray-700/50" },
};

function ConditionsBar({ data }: { data: RecommendationsResponse }) {
  const { conditions } = data;

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {conditions.waterTemp && (
        <div className="flex items-center gap-2 bg-navy-800/60 border border-navy-700/40 rounded-lg px-3 py-2">
          <span className="text-sm">🌡️</span>
          <div>
            <span className="text-xs font-mono text-gray-500 block">Water Temp</span>
            <span className="text-sm font-mono text-gray-200">
              {conditions.waterTemp.fahrenheit.toFixed(0)}°F
            </span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 bg-navy-800/60 border border-navy-700/40 rounded-lg px-3 py-2">
        <span className="text-sm">🌊</span>
        <div>
          <span className="text-xs font-mono text-gray-500 block">Tide</span>
          <span className="text-sm font-mono text-gray-200 capitalize">
            {conditions.currentTideState}
            {conditions.nextTide && (
              <span className="text-gray-500">
                {" "}· next {conditions.nextTide.type === "H" ? "high" : "low"} at{" "}
                {conditions.nextTide.time}
              </span>
            )}
          </span>
        </div>
      </div>
      {conditions.weather && (
        <>
          <div className="flex items-center gap-2 bg-navy-800/60 border border-navy-700/40 rounded-lg px-3 py-2">
            <span className="text-sm">☀️</span>
            <div>
              <span className="text-xs font-mono text-gray-500 block">Weather</span>
              <span className="text-sm font-mono text-gray-200">
                {conditions.weather.temperature}°F · {conditions.weather.shortForecast}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-navy-800/60 border border-navy-700/40 rounded-lg px-3 py-2">
            <span className="text-sm">💨</span>
            <div>
              <span className="text-xs font-mono text-gray-500 block">Wind</span>
              <span className="text-sm font-mono text-gray-200">
                {conditions.weather.windSpeed} {conditions.weather.windDirection}
              </span>
            </div>
          </div>
        </>
      )}
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
    <div className="mt-3 pt-3 border-t border-navy-700/30 grid grid-cols-2 gap-2">
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
  const config = ratingConfig[species.rating];

  return (
    <div className="bg-navy-800/50 border border-navy-700/50 rounded-xl p-4 hover:border-sand/20 transition-all">
      <div className="flex items-start justify-between">
        <Link
          to={`/species/${species.slug}`}
          className="flex items-center gap-3 group flex-1"
        >
          <span className="text-2xl">{species.icon}</span>
          <div>
            <h4 className="text-base font-semibold text-gray-100 group-hover:text-sand transition-colors">
              {species.name}
            </h4>
            <p className="text-xs font-mono text-gray-500 mt-0.5">
              {species.reason}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold font-mono text-gray-200">
            {species.score}
          </span>
          <span
            className={`text-xs font-mono px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}
          >
            {config.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs font-mono text-gray-500">
        <span>{species.zone.toLowerCase()}</span>
        <span>{species.avgSize}</span>
        <span>Limit: {species.bagLimit}</span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-auto text-sand/60 hover:text-sand transition-colors"
        >
          {expanded ? "hide details" : "score breakdown"}
        </button>
      </div>

      {expanded && <ScoreBreakdown factors={species.factors} />}
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <span>🎣</span> What's Biting Now
          </h2>
          <p className="text-xs font-mono text-gray-500 mt-1">
            Live conditions · Scored against each species' preferences · Updates every 5 min
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-mono text-gray-600">
            Data from NOAA Tides · NDBC Buoy · NWS Weather
          </p>
          <p className="text-[11px] font-mono text-gray-600">
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
