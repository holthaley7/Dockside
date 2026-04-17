import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSpecies, type SpeciesListItem } from "../lib/api";
import { useViewMode } from "../context/ViewModeContext";

type ZoneFilter = "ALL" | "OFFSHORE" | "NEARSHORE";

export default function Home() {
  const { compact } = useViewMode();
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
    { label: "All", value: "ALL" },
    { label: "Offshore", value: "OFFSHORE" },
    { label: "Nearshore", value: "NEARSHORE" },
  ];

  return (
    <div className={`${compact ? "max-w-xl" : "max-w-5xl"} mx-auto px-4 py-10 transition-all`}>
      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-1">Species Guide</h2>
        <p className="text-gray-500 font-mono text-xs">
          10 target species &middot; regulations &middot; tactics
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search species, bait, gear..."
            aria-label="Search species, bait, or gear"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-800 border border-navy-600 rounded-lg px-4 py-2.5 pl-10 text-sm font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-sand/40 focus:ring-1 focus:ring-sand/20 transition"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600"
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
              className={`px-4 py-2.5 rounded-lg text-xs font-mono transition ${
                zone === f.value
                  ? "bg-sand/15 text-sand border border-sand/25"
                  : "bg-navy-800 text-gray-500 border border-navy-700 hover:text-gray-300 hover:border-navy-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Species Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-6 h-6 border-2 border-sand/30 border-t-sand rounded-full animate-spin" />
        </div>
      ) : species.length === 0 ? (
        <div className="text-center py-24 text-gray-600 font-mono text-sm">
          No species found
        </div>
      ) : (
        <div className="space-y-10">
          {(["OFFSHORE", "NEARSHORE"] as const)
            .filter((zone) => species.some((s) => s.zone === zone))
            .map((zone) => (
              <div key={zone}>
                <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-3">
                  <span>{zone === "OFFSHORE" ? "Offshore" : "Nearshore"}</span>
                  <span className="flex-1 border-t border-navy-700/50" />
                </h3>
                <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                  {species.filter((s) => s.zone === zone).map((s) => (
              <Link
                key={s.id}
                to={`/species/${s.slug}`}
                className="group bg-navy-800/40 border border-navy-700/50 rounded-xl p-5 hover:border-sand/20 hover:bg-navy-800/70 transition-all duration-200"
              >
                {/* Fish photo */}
                <div className="w-full rounded-lg overflow-hidden bg-navy-950 mb-4 flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
                  {s.imageUrl ? (
                    <img
                      src={s.imageUrl}
                      alt={s.name}
                      className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-4xl w-full h-full">
                      {s.icon}
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-100 group-hover:text-sand transition-colors leading-tight">
                      {s.name}
                    </h3>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded mt-1 inline-block ${
                        s.zone === "OFFSHORE"
                          ? "bg-blue-900/40 text-blue-400"
                          : "bg-teal-900/40 text-teal-400"
                      }`}
                    >
                      {s.zone.toLowerCase()}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="min-w-0">
                    <span className="text-gray-600 block mb-0.5">Season</span>
                    <span className="text-gray-400 truncate block">{s.peakSeason}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-gray-600 block mb-0.5">Avg size</span>
                    <span className="text-gray-400 truncate block">{s.avgSize}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-gray-600 block mb-0.5">Bag limit</span>
                    <span className="text-gray-400 truncate block">{s.bagLimit}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-gray-600 block mb-0.5">Water</span>
                    <span className="text-gray-400 truncate block">{s.waterTemp}</span>
                  </div>
                </div>
              </Link>
          ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
