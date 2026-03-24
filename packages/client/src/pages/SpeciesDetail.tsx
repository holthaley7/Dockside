import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchSpeciesBySlug, type Species } from "../lib/api";
import { useViewMode } from "../context/ViewModeContext";

type Tab = "overview" | "tactics" | "regulations" | "community";

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-navy-800/60 border border-navy-700/40 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-sm text-gray-200">{value}</p>
    </div>
  );
}

export default function SpeciesDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { compact } = useViewMode();
  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchSpeciesBySlug(slug)
      .then(setSpecies)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-sand/30 border-t-sand rounded-full animate-spin" />
      </div>
    );
  }

  if (!species) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 font-mono">Species not found</p>
        <Link to="/species" className="text-sand text-sm font-mono mt-4 inline-block">
          &larr; Back to species
        </Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "tactics", label: "Tactics & Gear" },
    { id: "regulations", label: "Regulations" },
    { id: "community", label: "Community" },
  ];

  return (
    <div className={`${compact ? "max-w-xl" : "max-w-6xl"} mx-auto px-4 py-8 transition-all`}>
      {/* Breadcrumb */}
      <Link
        to="/species"
        className="text-sm font-mono text-gray-500 hover:text-sand transition-colors mb-6 inline-block"
      >
        &larr; All Species
      </Link>

      {/* Header */}
      <div className={`flex ${compact ? "flex-col" : "items-start"} gap-5 mb-8`}>
        {/* Fish photo */}
        <div
          className={`rounded-xl overflow-hidden bg-navy-950 flex items-center justify-center ${
            compact ? "w-full h-44" : "flex-shrink-0"
          }`}
          style={compact ? undefined : { width: 180, height: 120 }}
        >
          {species.imageUrl ? (
            <img
              src={species.imageUrl}
              alt={species.name}
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <span className="text-5xl">{species.icon}</span>
          )}
        </div>

        {/* Name & meta */}
        <div className={compact ? "" : "pt-1"}>
          <h1 className="text-3xl font-bold text-gray-100 mb-3">{species.name}</h1>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                species.zone === "OFFSHORE"
                  ? "bg-blue-900/50 text-blue-300"
                  : "bg-teal-900/50 text-teal-300"
              }`}
            >
              {species.zone.toLowerCase()}
            </span>
            <span className="text-xs font-mono text-gray-500">
              Peak: {species.peakSeason}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-navy-700/50 mb-8">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-mono transition-colors relative ${
                tab === t.id
                  ? "text-sand"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t.label}
              {tab === t.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sand" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
            <InfoCard icon="📏" label="Average Size" value={species.avgSize} />
            <InfoCard icon="🌡️" label="Water Temp" value={species.waterTemp} />
            <InfoCard icon="📅" label="Season" value={species.season} />
            <InfoCard icon="⭐" label="Peak Season" value={species.peakSeason} />
            <InfoCard icon="🕐" label="Prime Time" value={species.primeHour} />
            <InfoCard icon="🌊" label="Ideal Tides" value={species.idealTides} />
          </div>

          <div className="bg-navy-800/40 border border-navy-700/40 rounded-xl p-6">
            <h3 className="text-sm font-mono text-sand uppercase tracking-wider mb-3">
              Migration Patterns
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {species.migrationPatterns}
            </p>
          </div>

          <div className="bg-navy-800/40 border border-navy-700/40 rounded-xl p-6">
            <h3 className="text-sm font-mono text-sand uppercase tracking-wider mb-3">
              Depth & Habitat
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {species.idealDepths}
            </p>
          </div>
        </div>
      )}

      {tab === "tactics" && (
        <div className="space-y-6">
          <div className="bg-navy-800/40 border border-navy-700/40 rounded-xl p-6">
            <h3 className="text-sm font-mono text-sand uppercase tracking-wider mb-3">
              🎣 Bait
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {species.bait}
            </p>
          </div>

          <div className="bg-navy-800/40 border border-navy-700/40 rounded-xl p-6">
            <h3 className="text-sm font-mono text-sand uppercase tracking-wider mb-3">
              🔧 Gear Setup
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {species.gear}
            </p>
          </div>

          <div className="bg-navy-800/40 border border-navy-700/40 rounded-xl p-6">
            <h3 className="text-sm font-mono text-sand uppercase tracking-wider mb-3">
              👁️ Vision & Color Preferences
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {species.visionAndColor}
            </p>
          </div>
        </div>
      )}

      {tab === "regulations" && (
        <div className="space-y-6">
          <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
            <div className="bg-navy-800/60 border border-navy-700/40 rounded-lg p-5">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-1">
                Bag Limit
              </span>
              <p className="text-xl font-bold text-gray-100">
                {species.bagLimit}
              </p>
            </div>
            <div className="bg-navy-800/60 border border-navy-700/40 rounded-lg p-5">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-1">
                Size Limit
              </span>
              <p className="text-xl font-bold text-gray-100">
                {species.sizeLimit === "none" ? "No minimum" : species.sizeLimit}
              </p>
            </div>
          </div>

          <div className="bg-navy-800/40 border border-navy-700/40 rounded-xl p-6">
            <h3 className="text-sm font-mono text-sand uppercase tracking-wider mb-3">
              🔪 Fillet Rules
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {species.filletRules}
            </p>
          </div>

          <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-6">
            <h3 className="text-sm font-mono text-red-400 uppercase tracking-wider mb-3">
              ⚠️ Must Know
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {species.mustKnow}
            </p>
          </div>

          <p className="text-xs font-mono text-gray-600">
            Last verified: {new Date(species.updatedAt).toLocaleDateString()} &middot;{" "}
            <a
              href="https://nrm.dfg.ca.gov/FileHandler.ashx?DocumentID=239985&inline"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sand/60 hover:text-sand transition-colors"
            >
              CA DFW 2026 Regulations
            </a>
          </p>
        </div>
      )}

      {tab === "community" && (
        <div className="text-center py-16">
          <p className="text-gray-500 font-mono text-sm mb-2">
            Community features coming in Phase 3
          </p>
          <p className="text-gray-600 font-mono text-xs">
            Catch reports, tips, and discussion threads
          </p>
        </div>
      )}
    </div>
  );
}
