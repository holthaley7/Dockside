import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSpecies, type SpeciesListItem } from "../lib/api";
import WhatsBiting from "../components/WhatsBiting";

type ZoneFilter = "ALL" | "OFFSHORE" | "NEARSHORE";

export default function Home() {
  const [species, setSpecies] = useState<SpeciesListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState<ZoneFilter>("ALL");

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      fetchSpecies(zone === "ALL" ? undefined : zone, search || undefined)
        .then(setSpecies)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timeout);
  }, [zone, search]);

  const filters: { label: string; value: ZoneFilter }[] = [
    { label: "All Species", value: "ALL" },
    { label: "Offshore", value: "OFFSHORE" },
    { label: "Nearshore", value: "NEARSHORE" },
  ];

  // Determine current month for "in season" badge
  const currentMonth = new Date().getMonth(); // 0-indexed
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  function isInPeakSeason(peakSeason: string): boolean {
    const current = monthNames[currentMonth].toLowerCase();
    const text = peakSeason.toLowerCase();
    // Parse "June - October" style strings
    const match = text.match(/(\w+)\s*[-–]\s*(\w+)/);
    if (!match) return text.includes(current);
    const startIdx = monthNames.findIndex(
      (m) => m.toLowerCase() === match[1]
    );
    const endIdx = monthNames.findIndex(
      (m) => m.toLowerCase() === match[2]
    );
    if (startIdx === -1 || endIdx === -1) return false;
    if (startIdx <= endIdx) {
      return currentMonth >= startIdx && currentMonth <= endIdx;
    }
    return currentMonth >= startIdx || currentMonth <= endIdx;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-100 mb-2">
          San Diego Species Guide
        </h2>
        <p className="text-gray-400 font-mono text-sm">
          10 target species &middot; Regulations &middot; Tactics &middot;
          Community intel
        </p>
      </div>

      {/* What's Biting Now */}
      <WhatsBiting />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search species, bait, gear..."
            aria-label="Search species, bait, or gear"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-800 border border-navy-600 rounded-lg px-4 py-3 pl-10 text-sm font-mono text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sand/50 focus:ring-1 focus:ring-sand/25 transition"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setZone(f.value)}
              aria-pressed={zone === f.value}
              className={`px-4 py-2 rounded-lg text-sm font-mono transition ${
                zone === f.value
                  ? "bg-sand/20 text-sand border border-sand/30"
                  : "bg-navy-800 text-gray-400 border border-navy-600 hover:border-navy-500"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Species Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-sand/30 border-t-sand rounded-full animate-spin" />
        </div>
      ) : species.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-mono">
          No species found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {species.map((s) => {
            const inSeason = isInPeakSeason(s.peakSeason);
            return (
              <Link
                key={s.id}
                to={`/species/${s.slug}`}
                className="group bg-navy-800/50 border border-navy-700/50 rounded-xl p-5 hover:border-sand/20 hover:bg-navy-800/80 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100 group-hover:text-sand transition-colors">
                        {s.name}
                      </h3>
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                          s.zone === "OFFSHORE"
                            ? "bg-blue-900/50 text-blue-300"
                            : "bg-teal-900/50 text-teal-300"
                        }`}
                      >
                        {s.zone.toLowerCase()}
                      </span>
                    </div>
                  </div>
                  {inSeason && (
                    <span className="text-xs font-mono bg-green-900/40 text-green-400 px-2 py-1 rounded-full border border-green-800/50">
                      Peak Season
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-gray-500 block">Season</span>
                    <span className="text-gray-300">{s.peakSeason}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Size</span>
                    <span className="text-gray-300">{s.avgSize}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Bag Limit</span>
                    <span className="text-gray-300">{s.bagLimit}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Water Temp</span>
                    <span className="text-gray-300">{s.waterTemp}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
