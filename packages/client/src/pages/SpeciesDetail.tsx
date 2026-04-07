import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchSpeciesBySlug,
  fetchCatches,
  fetchHotspots,
  flagCatch,
  type Species,
  type CatchReport,
  type CatchStats,
  type RankedHotspot,
  type HotspotsResponse,
} from "../lib/api";
import { useViewMode } from "../context/ViewModeContext";
import CatchForm from "../components/CatchForm";

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

function getImageCredit(url: string): { source: string; href: string } | null {
  if (url.includes("fisheries.noaa.gov"))
    return { source: "NOAA Fisheries (public domain)", href: "https://www.fisheries.noaa.gov" };
  if (url.includes("takemefishing.org"))
    return { source: "Take Me Fishing / RBFF", href: "https://www.takemefishing.org" };
  if (url.includes("fishbase.se") || url.includes("fishbase.org"))
    return { source: "FishBase", href: "https://www.fishbase.se" };
  if (url.includes("wikimedia.org"))
    return { source: "Wikimedia Commons (CC BY)", href: "https://commons.wikimedia.org" };
  return null;
}

export default function SpeciesDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { compact } = useViewMode();
  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

  // Hotspots state
  const [hotspotsData, setHotspotsData] = useState<HotspotsResponse | null>(null);
  const [hotspotsLoading, setHotspotsLoading] = useState(false);
  const [hotspotsUpdatedAt, setHotspotsUpdatedAt] = useState<Date | null>(null);
  const [minutesSince, setMinutesSince] = useState(0);

  // Community tab state
  const [catchStats, setCatchStats] = useState<CatchStats | null>(null);
  const [catchesLoading, setCatchesLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchSpeciesBySlug(slug)
      .then(setSpecies)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  // Load live hotspots once species is loaded, refresh every 5 minutes
  useEffect(() => {
    if (!slug || !species) return;

    function load() {
      setHotspotsLoading(true);
      fetchHotspots(slug!)
        .then((data) => {
          setHotspotsData(data);
          setHotspotsUpdatedAt(new Date());
          setMinutesSince(0);
        })
        .catch(console.error)
        .finally(() => setHotspotsLoading(false));
    }

    load();
    const refreshInterval = setInterval(load, 5 * 60 * 1000); // every 5 min
    return () => clearInterval(refreshInterval);
  }, [slug, species?.id]);

  // Tick "last updated" counter every minute
  useEffect(() => {
    if (!hotspotsUpdatedAt) return;
    const tick = setInterval(() => {
      setMinutesSince(Math.floor((Date.now() - hotspotsUpdatedAt.getTime()) / 60000));
    }, 60 * 1000);
    return () => clearInterval(tick);
  }, [hotspotsUpdatedAt]);

  // Load catches when community tab becomes active
  useEffect(() => {
    if (tab !== "community" || !slug || catchStats) return;
    setCatchesLoading(true);
    fetchCatches(slug)
      .then(setCatchStats)
      .catch(console.error)
      .finally(() => setCatchesLoading(false));
  }, [tab, slug, catchStats]);

  function handleCatchSubmitted(report: CatchReport) {
    setShowForm(false);
    // Prepend new report and update stats
    setCatchStats((prev) => {
      if (!prev) return prev;
      const catches = [report, ...prev.catches];
      const total = catches.length;
      const avgWeight =
        Math.round((catches.reduce((s, c) => s + c.weightLbs, 0) / total) * 10) / 10;
      return { ...prev, catches, total, avgWeight };
    });
  }

  async function handleFlag(catchId: string) {
    try {
      await flagCatch(catchId);
      setFlaggedIds((prev) => new Set(prev).add(catchId));
    } catch {
      // silent — flag still marks locally
      setFlaggedIds((prev) => new Set(prev).add(catchId));
    }
  }

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
        <div className={`flex-shrink-0 ${compact ? "w-full" : ""}`}>
          <div
            className={`rounded-xl overflow-hidden bg-navy-950 flex items-center justify-center ${
              compact ? "w-full h-44" : ""
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
          {species.imageUrl && (() => {
            const credit = getImageCredit(species.imageUrl);
            return credit ? (
              <p className="text-[10px] font-mono text-gray-600 mt-1 text-center">
                Photo:{" "}
                <a
                  href={credit.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition-colors"
                >
                  {credit.source}
                </a>
              </p>
            ) : null;
          })()}
        </div>

        {/* Name & meta */}
        <div className={compact ? "" : "pt-1 flex-1"}>
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

          {/* Live-ranked hotspots */}
          {(hotspotsLoading || hotspotsData) && (
            <div className="bg-navy-800/40 border border-navy-700/40 rounded-xl p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <h3 className="text-sm font-mono text-sand uppercase tracking-wider">
                  📍 Where to Find Them in San Diego
                </h3>
                {hotspotsData?.conditions && (
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono text-gray-500 justify-end">
                    {hotspotsData.conditions.waterTemp && (
                      <span className="px-1.5 py-0.5 rounded bg-navy-900/80 border border-navy-700/30">
                        💧 {hotspotsData.conditions.waterTemp.fahrenheit}°F water
                      </span>
                    )}
                    {hotspotsData.conditions.weather && (
                      <span className="px-1.5 py-0.5 rounded bg-navy-900/80 border border-navy-700/30">
                        💨 {hotspotsData.conditions.weather.windSpeed}
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded bg-navy-900/80 border border-navy-700/30">
                      🌊 {hotspotsData.conditions.currentTideState}
                    </span>
                  </div>
                )}
              </div>

              {/* Live badge + last updated */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${hotspotsLoading ? "bg-amber-400 animate-pulse" : "bg-green-400 animate-pulse"}`} />
                  <span className={`text-[10px] font-mono uppercase tracking-wider ${hotspotsLoading ? "text-amber-400" : "text-green-400"}`}>
                    {hotspotsLoading ? "Updating…" : "Live — ranked for right now"}
                  </span>
                </div>
                {hotspotsUpdatedAt && !hotspotsLoading && (
                  <span className="text-[10px] font-mono text-gray-600">
                    {minutesSince === 0 ? "Updated just now" : `Updated ${minutesSince}m ago`} · refreshes every 5 min
                  </span>
                )}
              </div>

              {/* Loading state */}
              {hotspotsLoading && !hotspotsData && (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-sand/30 border-t-sand rounded-full animate-spin" />
                </div>
              )}

              {/* Ranked cards */}
              {!hotspotsLoading && hotspotsData && hotspotsData.hotspots.length > 0 && (
                <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                  {hotspotsData.hotspots.map((spot, idx) => (
                    <HotspotCard key={spot.name} spot={spot} rank={idx + 1} />
                  ))}
                </div>
              )}
            </div>
          )}
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

          {species.stockStatus && (
            <div className="bg-navy-800/40 border border-navy-700/40 rounded-xl p-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-mono text-sand uppercase tracking-wider mb-1">
                  NOAA Stock Status
                </h3>
                <p className="text-sm text-gray-300">{species.stockStatus.summary}</p>
              </div>
              <p className="text-[10px] font-mono text-gray-600 flex-shrink-0 text-right">
                via FishWatch<br />
                {new Date(species.stockStatus.scannedAt).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-4">
            <p className="text-xs text-amber-200/70 leading-relaxed">
              <span className="font-semibold text-amber-300">⚠️ Regulations change.</span>{" "}
              The bag limits, size limits, and season dates shown above are for reference only and
              may not reflect the most current CDFW rules. Always confirm current regulations at{" "}
              <a
                href="https://wildlife.ca.gov/Regulations/Sport-Fish"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
              >
                wildlife.ca.gov
              </a>{" "}
              before fishing.
            </p>
            <p className="text-[10px] font-mono text-gray-600 mt-2">
              Last updated: {new Date(species.updatedAt).toLocaleDateString()} &middot;{" "}
              <a
                href="https://nrm.dfg.ca.gov/FileHandler.ashx?DocumentID=239985&inline"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sand/50 hover:text-sand transition-colors"
              >
                CA DFW Ocean Sport Fishing Regulations (PDF)
              </a>
            </p>
          </div>
        </div>
      )}

      {tab === "community" && (
        <div className="space-y-5">
          {/* Log Your Catch button */}
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center py-3 rounded-xl bg-sand text-navy-950 font-bold text-sm hover:bg-sand/90 transition-colors"
          >
            Log Your Catch
          </button>

          {/* Loading */}
          {catchesLoading && (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-sand/30 border-t-sand rounded-full animate-spin" />
            </div>
          )}

          {/* Stats summary */}
          {!catchesLoading && catchStats && catchStats.total > 0 && (
            <div className="bg-navy-800/50 border border-navy-700/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono text-sand uppercase tracking-wider">
                  Community Insights
                </h3>
                <span className="text-xs font-mono text-gray-500">
                  {catchStats.total} {catchStats.total === 1 ? "catch" : "catches"} reported
                </span>
              </div>

              <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"}`}>
                {catchStats.avgWeight !== null && (
                  <StatBox
                    label="Avg Weight"
                    value={`${catchStats.avgWeight} lbs`}
                    icon="⚖️"
                  />
                )}
                {catchStats.topLocations.length > 0 && (
                  <StatBox
                    label="Top Spots"
                    value={catchStats.topLocations.map((l) => l.name).join(", ")}
                    icon="📍"
                  />
                )}
                {catchStats.topBaits.length > 0 && (
                  <StatBox
                    label="Top Baits"
                    value={catchStats.topBaits.map((b) => b.name).join(", ")}
                    icon="🪱"
                  />
                )}
                {catchStats.topTides.length > 0 && (
                  <StatBox
                    label="Best Tides"
                    value={catchStats.topTides.map((t) => t.name).join(", ")}
                    icon="🌊"
                  />
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!catchesLoading && catchStats && catchStats.total === 0 && (
            <p className="text-center text-gray-500 font-mono text-sm py-6">
              No catch reports yet — be the first to log one!
            </p>
          )}

          {/* Catch cards */}
          {!catchesLoading &&
            catchStats?.catches.map((report) => {
              const locationLabel = report.locationName ?? report.locationOther ?? "Unknown";
              const dateStr = new Date(report.dateCaught).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const isFlagged = flaggedIds.has(report.id) || report.flagged;

              return (
                <div
                  key={report.id}
                  className={`bg-navy-800/50 border rounded-xl overflow-hidden ${
                    isFlagged ? "border-amber-700/40 opacity-70" : "border-navy-700/50"
                  }`}
                >
                  {/* Photo or placeholder */}
                  <div className="h-40 bg-navy-950 flex items-center justify-center relative overflow-hidden">
                    {report.photoUrl ? (
                      <img
                        src={report.photoUrl}
                        alt="Catch"
                        className="w-full h-full object-cover"
                      />
                    ) : species.imageUrl ? (
                      <img
                        src={species.imageUrl}
                        alt={species.name}
                        className="w-full h-full object-contain p-4 opacity-50"
                      />
                    ) : (
                      <span className="text-6xl opacity-30">{species.icon}</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
                    {/* Weight badge */}
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                      <span className="text-lg font-bold text-white">
                        {report.weightLbs} lbs
                      </span>
                      {report.lengthIn && (
                        <span className="text-xs font-mono text-gray-300">
                          · {report.lengthIn}"
                        </span>
                      )}
                    </div>
                    {/* C&R badge */}
                    {report.catchAndRelease && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-800/80 text-teal-300 border border-teal-700/50">
                          C&R
                        </span>
                      </div>
                    )}
                    {/* Flagged badge */}
                    {isFlagged && (
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-900/80 text-amber-400 border border-amber-700/50">
                          Under Review
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-4 space-y-3">
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-sand">
                        @{report.username}
                      </span>
                      <span className="text-xs font-mono text-gray-500">
                        {dateStr}
                        {report.timeCaught ? ` · ${report.timeCaught}` : ""}
                      </span>
                    </div>

                    {/* Location */}
                    <p className="text-xs font-mono text-gray-400 flex items-center gap-1">
                      <span>📍</span> {locationLabel}
                    </p>

                    {/* Chips */}
                    <div className="flex flex-wrap gap-2">
                      {report.baitUsed && (
                        <Chip icon="🪱">{report.baitUsed}</Chip>
                      )}
                      {report.tideConditions && (
                        <Chip icon="🌊">{report.tideConditions}</Chip>
                      )}
                      {report.weatherConditions && (
                        <Chip icon="☀️">{report.weatherConditions}</Chip>
                      )}
                      {report.waterTempF && (
                        <Chip icon="🌡️">{report.waterTempF}°F</Chip>
                      )}
                    </div>

                    {/* Notes */}
                    {report.notes && (
                      <p className="text-sm text-gray-300 leading-relaxed italic border-t border-navy-700/30 pt-3">
                        "{report.notes}"
                      </p>
                    )}

                    {/* Report button */}
                    {!isFlagged && (
                      <button
                        onClick={() => handleFlag(report.id)}
                        className="text-[10px] font-mono text-gray-600 hover:text-amber-500 transition-colors"
                      >
                        ⚑ Report this catch
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {/* Catch form modal */}
          {showForm && species && (
            <CatchForm
              slug={slug!}
              speciesName={species.name}
              onSubmitted={handleCatchSubmitted}
              onClose={() => setShowForm(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

const RATING_CONFIG = {
  prime: { label: "Prime", dot: "bg-green-400", text: "text-green-400", border: "border-green-800/40", bg: "bg-green-950/20" },
  good:  { label: "Good",  dot: "bg-teal-400",  text: "text-teal-400",  border: "border-teal-800/40",  bg: "bg-teal-950/20"  },
  fair:  { label: "Fair",  dot: "bg-amber-400", text: "text-amber-400", border: "border-amber-800/40", bg: "bg-amber-950/20" },
  tough: { label: "Tough", dot: "bg-red-400",   text: "text-red-400",   border: "border-red-800/40",   bg: "bg-red-950/20"   },
};

function HotspotCard({ spot, rank }: { spot: RankedHotspot; rank: number }) {
  const cfg = RATING_CONFIG[spot.rating];
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`rounded-lg border ${cfg.border} ${cfg.bg} bg-navy-900/40 overflow-hidden`}>
      {/* Header — always visible */}
      <div className="p-4">
        {/* Rank + name + rating */}
        <div className="flex items-start gap-2 mb-2">
          <span className="text-[10px] font-mono text-gray-600 mt-0.5 w-4 flex-shrink-0">#{rank}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-100">{spot.name}</p>
              <span className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded ${cfg.text}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>
          </div>
        </div>

        {/* Condition blurb */}
        <p className={`text-xs font-medium leading-snug mb-3 ${cfg.text}`}>
          {spot.nowBlurb}
        </p>

        {/* "How to fish it now" toggle button */}
        <button
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
            open
              ? "bg-sand/10 border border-sand/30"
              : "bg-navy-950/60 border border-navy-700/40 hover:border-navy-600/60 hover:bg-navy-950/80"
          }`}
        >
          <span className={`text-xs font-mono font-semibold uppercase tracking-wider ${open ? "text-sand" : "text-gray-400"}`}>
            How to fish it right now
          </span>
          <span className={`text-xs font-mono transition-transform ${open ? "rotate-180 text-sand" : "text-gray-600"}`}>
            ▼
          </span>
        </button>
      </div>

      {/* Expandable method content */}
      {open && (
        <div ref={contentRef} className="border-t border-navy-700/40 bg-navy-950/40 px-4 pb-4 pt-3">
          <p className="text-sm text-gray-200 leading-relaxed">{spot.methodBlurb}</p>
          {/* Static spot note */}
          {spot.note && (
            <p className="text-xs text-gray-500 leading-relaxed mt-3 pt-3 border-t border-navy-700/30">
              {spot.note}
            </p>
          )}
          {/* Access note */}
          {spot.accessNote && (
            <p className="text-[10px] font-mono text-amber-400/80 mt-2 leading-snug">
              ⚓ {spot.accessNote}
            </p>
          )}
        </div>
      )}

      {/* Access note when collapsed (boat warning is important to show always) */}
      {!open && spot.accessNote && (
        <div className="px-4 pb-3">
          <p className="text-[10px] font-mono text-amber-400/80 leading-snug">
            ⚓ {spot.accessNote}
          </p>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-navy-900/60 border border-navy-700/30 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs">{icon}</span>
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs text-gray-300 leading-snug">{value}</p>
    </div>
  );
}

function Chip({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="text-xs font-mono px-2 py-0.5 rounded bg-navy-900/80 text-gray-300 border border-navy-700/40">
      {icon} {children}
    </span>
  );
}
